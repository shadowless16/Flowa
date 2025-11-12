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

    const data = await response.json()
    console.log("Mono API response:", JSON.stringify(data, null, 2))
    
    if (!response.ok || data.status === "failed") {
      console.error("Mono API error:", data)
      throw new Error(data.message || "Failed to fetch from Mono")
    }

    // Mono API returns: { account: { balance, currency, account_number, name }, institution: { name } }
    const account = data.account || data
    const institution = data.institution || {}
    
    return NextResponse.json({
      balance: account.balance || 0,
      currency: account.currency || "NGN",
      accountNumber: account.account_number || account.accountNumber || "N/A",
      accountName: account.name || session.user.name || "User",
      bankName: institution.name || user.bankName || "Bank",
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
