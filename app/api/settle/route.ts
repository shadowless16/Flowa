import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { splitId, amount } = await req.json()
    
    if (!splitId || !amount) {
      return NextResponse.json({ error: "Split ID and amount required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    // Update split settlement status
    const result = await db.collection("splits").updateOne(
      { _id: splitId, "participants.email": session.user.email },
      { 
        $set: { 
          "participants.$.settled": true,
          "participants.$.settledAt": new Date(),
          "participants.$.settledAmount": amount
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Split not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Settlement error:", error)
    return NextResponse.json({ error: "Settlement failed" }, { status: 500 })
  }
}