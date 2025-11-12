import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, narration, type, category } = body

    const client = await clientPromise
    const db = client.db("payverse")
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const transaction = {
      amount: Number(amount),
      narration,
      type,
      category,
      date: new Date().toISOString(),
    }

    console.log("🤖 Calling Gemini AI...")
    
    const notificationResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a smart financial assistant. A payment just happened:
- Type: ${type}
- Amount: ₦${amount}
- Description: ${narration}
- Category: ${category}

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
    console.log("📥 Gemini response:", JSON.stringify(geminiData, null, 2))
    
    const notificationText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "New transaction detected"
    console.log("💬 Generated notification:", notificationText)

    await db.collection("notifications").insertOne({
      userEmail: user.email,
      transaction,
      message: notificationText,
      read: false,
      createdAt: new Date(),
    })

    console.log("✅ Smart notification created:", notificationText)

    return NextResponse.json({ success: true, notification: notificationText })
  } catch (error) {
    console.error("Simulate payment error:", error)
    return NextResponse.json({ error: "Failed to simulate payment" }, { status: 500 })
  }
}
