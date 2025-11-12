import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/db/mongodb"

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json()

    const client = await clientPromise
    const db = client.db("payverse")

    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.collection("users").insertOne({
      name,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "User created successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
