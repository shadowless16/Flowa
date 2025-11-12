import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { goalId, amount } = body

    if (!goalId || !amount) {
      return NextResponse.json({ error: "Goal ID and amount required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    await db.collection("goals").updateOne(
      { _id: new ObjectId(goalId), userEmail: session.user.email },
      { 
        $inc: { currentAmount: Number(amount) },
        $set: { updatedAt: new Date() }
      }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contribution error:", error)
    return NextResponse.json({ error: "Failed to add contribution" }, { status: 500 })
  }
}
