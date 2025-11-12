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

    if (!response.ok) {
      console.error("Mono API error:", response.status)
      return NextResponse.json({
        balance: 100000,
        currency: "NGN",
        accountNumber: "0123456789",
        accountName: session.user.name || "User",
        bankName: user.bankName || "Test Bank",
      })
    }

    const data = await response.json()
    console.log("Mono balance data:", data)
    
    return NextResponse.json({
      balance: data.account?.balance || data.balance || 100000,
      currency: data.account?.currency || data.currency || "NGN",
      accountNumber: data.account?.account_number || data.accountNumber || "0123456789",
      accountName: data.account?.name || session.user.name || "User",
      bankName: data.institution?.name || user.bankName || "Test Bank",
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
