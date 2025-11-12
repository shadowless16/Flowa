import { NextResponse } from "next/server"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, data } = body

    if (event === "mono.events.transaction_updated") {
      const { account, transaction } = data
      
      const client = await clientPromise
      const db = client.db("payverse")
      const user = await db.collection("users").findOne({ monoAccountId: account })
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const notificationResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a smart financial assistant. A payment just happened:
- Type: ${transaction.type}
- Amount: ₦${transaction.amount}
- Description: ${transaction.narration}
- Category: ${transaction.category || "Unknown"}

Generate a SHORT, friendly, actionable notification (max 2 sentences) that:
1. Acknowledges the transaction
2. Suggests a smart financial action (save, budget alert, spending tip)

Examples:
- For salary: "🎉 Salary received! Would you like to save 10% (₦25,000) to your Emergency Fund?"
- For large expense: "You just spent ₦45,000 on shopping. That's 80% of your monthly budget!"
- For food: "Another restaurant visit? You've spent ₦12,000 on dining this week."

Keep it conversational and helpful. No generic responses.`
              }]
            }]
          })
        }
      )

      const geminiData = await notificationResponse.json()
      const notificationText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "New transaction detected"

      await db.collection("notifications").insertOne({
        userEmail: user.email,
        transaction: transaction,
        message: notificationText,
        read: false,
        createdAt: new Date(),
      })

      console.log("✅ Smart notification created:", notificationText)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
