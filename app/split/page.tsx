"use client"

import Link from "next/link"
import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"

export default function SplitPage() {
  const [amount, setAmount] = useState("")
  const [friends, setFriends] = useState([
    { id: "1", name: "John", included: false },
    { id: "2", name: "Sarah", included: false },
    { id: "3", name: "Mike", included: false },
  ])

  const includedCount = friends.filter((f) => f.included).length
  const splitAmount = amount ? Math.round(Number.parseInt(amount) / (includedCount + 1)) : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
        <Link href="/" className="text-2xl">
          ←
        </Link>
        <h1 className="text-xl font-bold">Split Bill</h1>
        <button className="text-2xl">•••</button>
      </div>

      {/* Amount Card */}
      <div className="px-4 py-6">
        <div className="gradient-primary rounded-3xl p-6 text-white shadow-lg text-center">
          <p className="text-white/80 text-sm mb-2">Total Amount</p>
          <h2 className="text-4xl font-bold mb-4">₦{amount || "0"}</h2>
          <div className="bg-white/20 rounded-2xl p-4">
            <p className="text-sm text-white/80">Each person pays</p>
            <p className="text-2xl font-bold">₦{splitAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-4">
        <label className="block text-sm font-semibold mb-2">Enter Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full border-2 border-primary rounded-lg p-4 text-center text-2xl font-bold focus:outline-none"
        />
      </div>

      {/* Friends */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">Who's splitting?</h3>
        <div className="space-y-2">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setFriends(friends.map((f) => (f.id === friend.id ? { ...f, included: !f.included } : f)))}
              className={`w-full p-4 rounded-2xl flex items-center justify-between font-semibold transition-all ${
                friend.included
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-foreground hover:bg-gray-50"
              }`}
            >
              <span>{friend.name}</span>
              {friend.included && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 py-4">
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-lg">
          Generate Share Link
        </button>
        <p className="text-xs text-center text-muted-foreground mt-3">Friends will get a link to pay their share</p>
      </div>

      <BottomNav />
    </main>
  )
}
