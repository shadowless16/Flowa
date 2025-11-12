import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transactionId, category } = await req.json()
    
    if (!transactionId || !category) {
      return NextResponse.json({ error: "Transaction ID and category required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    // Update transaction category in mock transactions
    await db.collection("mockTransactions").updateOne(
      { 
        userEmail: session.user.email,
        "transactions._id": transactionId 
      },
      { 
        $set: { "transactions.$.category": category }
      }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Categorization error:", error)
    return NextResponse.json({ error: "Failed to categorize transaction" }, { status: 500 })
  }
}