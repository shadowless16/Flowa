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
    
    const budgets = await db.collection("budgets").find({ userEmail: session.user.email }).toArray()
    
    return NextResponse.json({ budgets })
  } catch (error) {
    console.error("Budgets fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { category, amount, month } = body

    if (!category || !amount) {
      return NextResponse.json({ error: "Category and amount required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const budget = {
      userEmail: session.user.email,
      category,
      amount: Number(amount),
      month: month || new Date().toISOString().slice(0, 7),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection("budgets").insertOne(budget)
    
    return NextResponse.json({ budget: { ...budget, _id: result.insertedId } })
  } catch (error) {
    console.error("Budget creation error:", error)
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { _id, ...updates } = body

    if (!_id) {
      return NextResponse.json({ error: "Budget ID required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    await db.collection("budgets").updateOne(
      { _id: new ObjectId(_id), userEmail: session.user.email },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Budget update error:", error)
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 })
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
      return NextResponse.json({ error: "Budget ID required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    await db.collection("budgets").deleteOne({ _id: new ObjectId(id), userEmail: session.user.email })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Budget deletion error:", error)
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 })
  }
}
