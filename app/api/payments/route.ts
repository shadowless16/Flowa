import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, category, description, type } = await req.json()

    const client = await clientPromise
    const db = client.db("payverse")

    const payment = {
      userId: session.user.email,
      amount: Number(amount),
      category,
      description,
      type: type || "debit",
      saved: Math.floor(Number(amount) * 0.1),
      date: new Date(),
      createdAt: new Date(),
    }

    const result = await db.collection("payments").insertOne(payment)

    return NextResponse.json({ 
      message: "Payment added successfully",
      id: result.insertedId,
      payment,
      notification: {
        amount: payment.amount,
        category: payment.category,
        description: payment.description,
        saved: payment.saved,
      }
    })
  } catch (error) {
    console.error("Add payment error:", error)
    return NextResponse.json({ error: "Failed to add payment" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("payverse")

    const payments = await db
      .collection("payments")
      .find({ userId: session.user.email })
      .sort({ date: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Fetch payments error:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
