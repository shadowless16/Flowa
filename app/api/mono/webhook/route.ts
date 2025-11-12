import { NextResponse } from "next/server"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("🔔 Mono Webhook received:", body)

    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get("mono-webhook-signature")
    
    if (body.event === "mono.events.account_updated") {
      const { account, data } = body
      
      // Find user with this Mono account ID
      const client = await clientPromise
      const db = client.db()
      const user = await db.collection("users").findOne({ 
        monoAccountId: account.id 
      })

      if (!user) {
        console.log("❌ No user found for account:", account.id)
        return NextResponse.json({ status: "user_not_found" })
      }

      // Process new transactions
      if (data.transactions && data.transactions.length > 0) {
        for (const transaction of data.transactions) {
          await processTransaction(transaction, user, db)
        }
      }
    }

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}

async function processTransaction(transaction: any, user: any, db: any) {
  const amount = Math.abs(transaction.amount) / 100 // Convert kobo to naira
  const isDebit = transaction.type === "debit"
  
  if (!isDebit) return // Only notify for spending (debit transactions)

  // Smart categorization (same logic as before)
  const detectCategory = (narration: string, amount: number) => {
    const desc = narration.toLowerCase()
    
    if (desc.includes('uber') || desc.includes('bolt') || desc.includes('fuel')) {
      return 'Transportation'
    }
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('pizza')) {
      return 'Food & Dining'
    }
    if (desc.includes('shop') || desc.includes('store') || desc.includes('market')) {
      return 'Shopping'
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('cinema')) {
      return 'Entertainment'
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('bill')) {
      return 'Bills'
    }
    
    // For generic transfers, categorize by amount
    if (amount < 5000) return 'Food & Dining'
    if (amount < 15000) return 'Transportation'
    if (amount < 30000) return 'Shopping'
    if (amount < 50000) return 'Entertainment'
    return 'Bills'
  }

  const category = detectCategory(transaction.narration || '', amount)
  const saved = Math.round(amount * 0.1) // 10% auto-savings

  // Store transaction in database
  await db.collection("transactions").insertOne({
    userId: user._id,
    monoTransactionId: transaction.id,
    amount,
    category,
    description: transaction.narration,
    date: new Date(transaction.date),
    type: "mono_webhook",
    saved,
    createdAt: new Date()
  })

  // Send push notification
  await sendTransactionNotification(user.email, {
    amount,
    category,
    description: transaction.narration,
    saved
  })

  console.log(`✅ Processed transaction: ₦${amount.toLocaleString()} - ${category}`)
}

async function sendTransactionNotification(userEmail: string, transaction: any) {
  try {
    // Send to notification API
    await fetch(`${process.env.NEXTAUTH_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail,
        title: `₦${transaction.amount.toLocaleString()} spent`,
        message: `${transaction.description}\n💰 +₦${transaction.saved} saved automatically!`,
        category: transaction.category,
        type: "transaction"
      })
    })

    console.log(`🔔 Notification sent for ₦${transaction.amount.toLocaleString()}`)
  } catch (error) {
    console.error("❌ Notification failed:", error)
  }
}