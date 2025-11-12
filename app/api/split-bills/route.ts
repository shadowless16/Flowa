import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { totalAmount, description, participants } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const splitBill = {
      creatorEmail: session.user.email,
      creatorName: session.user.name,
      totalAmount,
      description,
      participants,
      status: "pending",
      createdAt: new Date(),
      payments: []
    }

    const result = await db.collection("split_bills").insertOne(splitBill)

    return NextResponse.json({
      success: true,
      billId: result.insertedId,
      shareLink: `${process.env.NEXTAUTH_URL}/split/${result.insertedId}`
    })
  } catch (error) {
    console.error("Split bill creation error:", error)
    return NextResponse.json({ error: "Failed to create split bill" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    const bills = await db.collection("split_bills")
      .find({ creatorEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Fetch split bills error:", error)
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
  }
}
