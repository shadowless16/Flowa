import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { accountId, bankName } = body
    console.log("Update-bank request body:", body)
    console.log("Updating user:", session.user.email, "with account ID:", accountId)

    console.log("Debug: Received accountId in update-bank API:", accountId);
    
    const client = await clientPromise
    const db = client.db("payverse")

    const updateData: any = { 
      bankName: bankName || "ALAT by Wema", 
      bankConnected: true, 
      updatedAt: new Date() 
    }
    
    // Only update accountId if it's provided and not undefined
    if (accountId) {
      updateData.monoAccountId = accountId
      console.log("Debug: Updating monoAccountId in database:", accountId);
    }
    
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: updateData }
    )
    
    console.log("Update result:", result.modifiedCount, "documents modified")

    return NextResponse.json({ message: "Bank account updated successfully", accountId })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update bank account" }, { status: 500 })
  }
}
