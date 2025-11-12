import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const body = await req.json().catch(() => ({}))
  const { preferredCategories = [] } = body
  
  const client = await clientPromise
  const db = client.db("payverse")
  
  await db.collection("users").updateOne(
    { email: session.user.email },
    { 
      $set: { 
        onboardingComplete: true,
        preferredCategories: preferredCategories
      } 
    }
  )
  
  return NextResponse.json({ success: true })
}
