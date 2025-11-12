import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"
import { generateSmartReaction } from "@/lib/gemini-ai"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, type = "debit" } = await request.json()

    const client = await clientPromise
    const db = client.db()
    
    // Determine category based on description and type
    const category = type === "credit" ? "income" : "other"
    
    // Simulate transaction data like Mono webhook
    const simulatedTransaction = {
      id: `sim_${Date.now()}`,
      amount: amount * 100, // Convert to kobo
      description: description || "Simulated transaction",
      type,
      date: new Date().toISOString(),
      balance: Math.floor(Math.random() * 100000), // Random balance
      category
    }

    // Store simulation for demo
    await db.collection("simulated_transactions").insertOne({
      userEmail: session.user.email,
      transaction: simulatedTransaction,
      timestamp: new Date()
    })

    // Generate AI insight with proper category
    const aiInsight = await generateSmartReaction(amount, category, description)
    console.log("🤖 AI Insight generated:", aiInsight)
    
    // Create notification in database with AI insight
    const notificationMessage = type === "credit" 
      ? `💰 You received ₦${amount}! ${description}\n\n💡 ${aiInsight}` 
      : `💸 You spent ₦${amount} on ${description}\n\n💡 ${aiInsight}`
    
    await db.collection("notifications").insertOne({
      userEmail: session.user.email,
      message: notificationMessage,
      transaction: {
        type,
        amount,
        narration: description,
        category: "transfer"
      },
      createdAt: new Date(),
      read: false
    })

    const notificationPayload = {
      title: type === "credit" ? "💰 Money Received" : "💸 Payment Made",
      body: `${type === "credit" ? "+" : "-"}₦${amount.toLocaleString()} - ${description}\n\n💡 ${aiInsight}`,
      data: {
        transactionId: simulatedTransaction.id,
        amount: simulatedTransaction.amount,
        type,
        description
      }
    }

    console.log("Push notification would be sent:", notificationPayload)

    return NextResponse.json({
      success: true,
      transaction: simulatedTransaction,
      notification: notificationPayload
    })

  } catch (error) {
    console.error("Simulation error:", error)
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}