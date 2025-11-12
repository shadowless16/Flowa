import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const splits = await db.collection("splits")
      .find({ $or: [{ creatorEmail: session.user.email }, { "participants.email": session.user.email }] })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ splits })
  } catch (error) {
    console.error("Splits fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch splits" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, description, participants } = body

    const client = await clientPromise
    const db = client.db("payverse")
    
    const user = await db.collection("users").findOne({ email: session.user.email })
    
    const splitAmount = Math.round(amount / (participants.length + 1))
    
    const split = {
      creatorEmail: session.user.email,
      creatorName: user?.name || "You",
      amount: Number(amount),
      description: description || "Bill Split",
      splitAmount,
      participants: participants.map((p: any) => ({
        name: p.name,
        email: p.email || "",
        paid: false,
      })),
      status: "pending",
      createdAt: new Date(),
    }

    const result = await db.collection("splits").insertOne(split)
    
    return NextResponse.json({ success: true, splitId: result.insertedId })
  } catch (error) {
    console.error("Split creation error:", error)
    return NextResponse.json({ error: "Failed to create split" }, { status: 500 })
  }
}
