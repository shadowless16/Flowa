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
    const db = client.db("payverse")
    
    const user = await db.collection("users").findOne({ email: session.user.email })
    
    const defaultCategories = [
      { id: "food", name: "Food & Dining", emoji: "🍽️" },
      { id: "transport", name: "Transportation", emoji: "🚗" },
      { id: "bills", name: "Bills & Utilities", emoji: "💡" },
      { id: "shopping", name: "Shopping", emoji: "🛍️" },
      { id: "entertainment", name: "Entertainment", emoji: "🎬" },
    ]
    
    const preferredCategories = user?.preferredCategories || []
    
    return NextResponse.json({ 
      categories: defaultCategories,
      preferredCategories: preferredCategories
    })
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}