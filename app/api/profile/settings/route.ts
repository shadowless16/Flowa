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

    const connectedAccounts = []
    if (user.monoAccountId) {
      connectedAccounts.push({
        provider: "Mono",
        accountId: user.monoAccountId,
        bank: user.bankName || "ALAT by Wema",
        connected: true,
      })
    }

    return NextResponse.json({
      notifications: user.notificationSettings || { enabled: true, email: true, push: true },
      savingsRules: user.savingsRules || { roundUp: 5, triggerAmount: 500 },
      connectedAccounts,
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, data } = body

    const client = await clientPromise
    const db = client.db("payverse")

    const updateField = type === "notifications" ? "notificationSettings" : "savingsRules"
    
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { [updateField]: data, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
