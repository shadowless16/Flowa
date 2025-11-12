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
    
    if (!user?.monoAccountId) {
      return NextResponse.json({ error: "No bank account connected" }, { status: 400 })
    }

    const response = await fetch(`https://api.withmono.com/v1/accounts/${user.monoAccountId}/transactions`, {
      headers: {
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
    })

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log("✅ Using REAL Mono transaction data")
      return NextResponse.json({ ...data, source: "mono" })
    } catch (e) {
      console.log("⚠️ Mono sandbox mode - using mock data")
      
      // Check if mock transactions already exist for this user
      const existingMockTxns = await db.collection("mockTransactions").findOne({ userEmail: session.user.email })
      
      if (existingMockTxns) {
        console.log("📦 Using stored mock transactions")
        return NextResponse.json({ data: existingMockTxns.transactions, source: "mock" })
      }
      
      // Generate mock transactions ONCE and store them
      console.log("🔨 Generating new mock transactions")
      const mockTransactions = []
      const categories = ["Food & Dining", "Shopping", "Entertainment", "Transportation", "Bills"]
      const narrations = [
        ["Restaurant", "Fast Food", "Grocery Store", "Coffee Shop", "Bakery"],
        ["Online Shopping", "Clothing Store", "Electronics", "Pharmacy", "Bookstore"],
        ["Cinema", "Streaming Service", "Concert", "Gaming", "Sports Event"],
        ["Uber", "Fuel Station", "Parking", "Bus Fare", "Car Maintenance"],
        ["Electricity", "Internet", "Phone Bill", "Water Bill", "Rent"]
      ]
      
      // Generate transactions for last 8 weeks
      for (let week = 0; week < 8; week++) {
        for (let i = 0; i < 5; i++) {
          const catIndex = Math.floor(Math.random() * categories.length)
          const daysAgo = week * 7 + Math.floor(Math.random() * 7)
          mockTransactions.push({
            _id: `${week}-${i}`,
            amount: Math.floor(Math.random() * 50000) + 5000,
            type: "debit",
            narration: narrations[catIndex][Math.floor(Math.random() * narrations[catIndex].length)],
            date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
            category: categories[catIndex],
          })
        }
      }
      
      // Add some income transactions
      mockTransactions.push({
        _id: "income-1",
        amount: 250000,
        type: "credit",
        narration: "Salary Payment",
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        category: "income",
      })
      
      // Store mock transactions in database
      await db.collection("mockTransactions").insertOne({
        userEmail: session.user.email,
        transactions: mockTransactions,
        createdAt: new Date(),
      })
      
      return NextResponse.json({ data: mockTransactions, source: "mock" })
    }
  } catch (error) {
    console.error("Transaction fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
