import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const goals = await db.collection("goals").find({ userEmail: session.user.email }).toArray()
    
    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Goals fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, targetAmount, currentAmount = 0, deadline, icon, color, autoSaveRule } = body

    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Name and target amount required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const goal = {
      userEmail: session.user.email,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline: deadline || null,
      icon: icon || "piggy-bank",
      color: color || "#8B5CF6",
      autoSaveRule: autoSaveRule || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection("goals").insertOne(goal)
    
    return NextResponse.json({ goal: { ...goal, _id: result.insertedId } })
  } catch (error) {
    console.error("Goal creation error:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { _id, currentAmount, ...updates } = body

    if (!_id) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const updateData: any = { ...updates, updatedAt: new Date() }
    if (currentAmount !== undefined) {
      updateData.currentAmount = Number(currentAmount)
    }
    
    await db.collection("goals").updateOne(
      { _id: new ObjectId(_id), userEmail: session.user.email },
      { $set: updateData }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Goal update error:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    await db.collection("goals").deleteOne({ _id: new ObjectId(id), userEmail: session.user.email })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Goal deletion error:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
