import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, participants, description } = await req.json()

    const client = await clientPromise
    const db = client.db("payverse")

    const split = {
      createdBy: session.user.email,
      amount,
      participants,
      description,
      status: "pending",
      createdAt: new Date(),
    }

    const result = await db.collection("paySplits").insertOne(split)
    
    return NextResponse.json({ id: result.insertedId, ...split })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create split" }, { status: 500 })
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

    const splits = await db.collection("paySplits")
      .find({ 
        $or: [
          { createdBy: session.user.email },
          { "participants.email": session.user.email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ data: splits })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch splits" }, { status: 500 })
  }
}