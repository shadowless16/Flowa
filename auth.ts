import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/db/mongodb"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise
        const db = client.db("payverse")
        
        const user = await db.collection("users").findOne({ email: credentials.email })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        
        if (!isValid) return null
        
        return { id: user._id.toString(), email: user.email, name: user.name }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth
    },
  },
})
