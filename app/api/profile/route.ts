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
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const goals = await db.collection("goals").find({ userEmail: user.email }).toArray()
    const payments = await db.collection("payments").find({ userEmail: user.email }).toArray()

    const totalSaved = payments.reduce((sum, p) => sum + (p.saved || 0), 0)
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length
    const successRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || "/placeholder-user.jpg",
        status: "Active Member",
      },
      stats: {
        totalSaved,
        goals: goals.length,
        successRate,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone } = body

    const client = await clientPromise
    const db = client.db("payverse")

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { name, phone, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
