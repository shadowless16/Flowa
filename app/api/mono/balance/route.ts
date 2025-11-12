import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const user = await db.collection("users").findOne({ email: session.user.email })
    
    console.log("User found:", user?.email)
    console.log("Mono Account ID:", user?.monoAccountId)
    
    if (!user?.monoAccountId) {
      console.log("No bank account connected, returning mock data")
      return NextResponse.json({
        balance: 245680,
        currency: "NGN",
        accountNumber: "0123456789",
        accountName: session.user.name || "User",
        bankName: "Test Bank",
      })
    }

    const response = await fetch(`https://api.withmono.com/v1/accounts/${user.monoAccountId}`, {
      headers: {
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
    })

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      // Sandbox mode - return mock balance data with random variation
      const baseBalance = 245680
      const variation = Math.floor(Math.random() * 50000) - 25000
      return NextResponse.json({
        balance: baseBalance + variation,
        currency: "NGN",
        accountNumber: "0123456789",
        accountName: session.user.name || "User",
        bankName: "Test Bank",
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
