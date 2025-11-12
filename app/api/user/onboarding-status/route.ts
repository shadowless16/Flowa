import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export const runtime = "nodejs"

export async function GET() {
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
  
  return NextResponse.json({
    onboardingComplete: user.onboardingComplete || false,
    bankConnected: !!user.monoAccountId,
  })
}
