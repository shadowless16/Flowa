import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

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
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: "/placeholder-user.jpg",
    status: "Active Member",
  })
}
