import { NextResponse } from "next/server"
import clientPromise from "@/lib/db/mongodb"
import { auth } from "@/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await req.json()
    console.log("Exchanging code:", code)

    const response = await fetch("https://api.withmono.com/v2/accounts/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
      body: JSON.stringify({ code }),
    })

    const data = await response.json()
    console.log("Mono API response:", data)

    if (!response.ok) {
      console.error("Mono API error:", data)
      return NextResponse.json(
        { error: data.message || "Failed to authenticate", details: data },
        { status: response.status }
      )
    }

    // ✅ Extract account ID properly from v2 API
    const accountId = data.data?.id
    if (!accountId) {
      console.error("No account ID in response:", data)
      return NextResponse.json({ error: "Invalid response from Mono" }, { status: 500 })
    }

    // ✅ Update user record in MongoDB
    const client = await clientPromise
    const db = client.db()
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { bankConnected: true, monoAccountId: accountId } }
    )

    console.log("✅ Successfully connected bank account:", accountId)
    return NextResponse.json({ success: true, accountId })
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 })
  }
}
