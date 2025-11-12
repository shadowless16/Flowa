import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("payverse")
    
    const notifications = await db.collection("notifications")
      .find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()
    
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()

    const client = await clientPromise
    const db = client.db("payverse")
    
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(id), userEmail: session.user.email },
      { $set: { read: true } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
