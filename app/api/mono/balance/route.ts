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
    const db = client.db()
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user?.monoAccountId) {
      return NextResponse.json({ error: "No bank account connected" }, { status: 400 })
    }

    const response = await fetch(
      `https://api.withmono.com/v2/accounts/${user.monoAccountId}`,
      {
        headers: { "mono-sec-key": process.env.MONO_SECRET_KEY! },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("Mono balance error:", data)
      return NextResponse.json(
        { error: data.message || "Failed to fetch balance" },
        { status: response.status }
      )
    }

    const account = data.data.account
    return NextResponse.json({
      balance: account.available_balance ? account.available_balance / 100 : 0,
      ledgerBalance: account.ledger_balance ? account.ledger_balance / 100 : 0,
      currency: account.currency,
      accountNumber: account.account_number,
      accountName: account.account_name,
      bankName: account.institution?.name,
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
