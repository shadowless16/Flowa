import { NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/db/mongodb"

export const runtime = "nodejs"

export async function POST() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const client = await clientPromise
  const db = client.db("payverse")
  
  const user = await db.collection("users").findOne({ email: session.user.email })
  
  if (!user?.monoAccountId) {
    return NextResponse.json({ error: "No bank connected" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.withmono.com/v1/accounts/${user.monoAccountId}`, {
      headers: {
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
      },
    })

    const data = await response.json()
    
    if (response.ok && data.account) {
      await db.collection("users").updateOne(
        { email: session.user.email },
        { 
          $set: { 
            monoLastSync: new Date(),
          } 
        }
      )
      
      return NextResponse.json({ 
        success: true, 
        balance: data.account.balance,
      })
    }
    
    return NextResponse.json({ error: "Failed to fetch from Mono" }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 })
  }
}
