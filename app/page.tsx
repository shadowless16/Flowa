"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { GradientCard } from "@/components/gradient-card"
import { mockUser, mockTransactions } from "@/lib/mock-data"
import { notificationService } from "@/lib/notification-service"
import type { Notification } from "@/lib/types"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(mockUser)
  const [transactions, setTransactions] = useState(mockTransactions)
  const [showPaymentSheet, setShowPaymentSheet] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 3))
    })
    return unsubscribe
  }, [])

  const monthlyGoal = 120000
  const spent = user.totalSpent
  const progress = (spent / monthlyGoal) * 100

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-bold">Hi, {user.name.split(" ")[0]} 👋</h1>
        <button className="text-2xl">🔔</button>
      </div>

      {/* Main Balance Card */}
      <div className="px-4 py-6">
        <GradientCard variant="primary">
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-white/80 text-sm mb-2">Total Balance</p>
              <h2 className="text-4xl font-bold">₦{user.totalSaved.toLocaleString()}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-2xl">💳</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-xs mb-1">Spending</p>
              <p className="text-2xl font-bold">₦{user.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">Savings Rate</p>
              <p className="text-2xl font-bold">{user.successRate}%</p>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Monthly Goal Progress */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">Monthly Savings Goal</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              ₦{spent.toLocaleString()} of ₦{monthlyGoal.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ₦{(monthlyGoal - spent).toLocaleString()} more to reach your goal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowPaymentSheet(true)}
            className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:bg-gray-50"
          >
            <span className="text-2xl">➕</span>
            <span className="text-xs text-center">Add Payment</span>
          </button>
          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:bg-gray-50">
            <span className="text-2xl">🔄</span>
            <span className="text-xs text-center">Split Bill</span>
          </button>
          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:bg-gray-50">
            <span className="text-2xl">📊</span>
            <span className="text-xs text-center">Insights</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">Recent Moments</h3>
          <button className="text-xs text-primary hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">{txn.category}</p>
                </div>
                <p className="font-bold text-sm">₦{txn.amount.toLocaleString()}</p>
              </div>
              <p className="text-xs text-green-600 bg-green-50 rounded-lg p-2">✓ ₦{txn.saved} saved</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Sheet Modal */}
      {showPaymentSheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:w-96 p-6 animate-in slide-in-from-bottom-96 md:slide-in-from-bottom-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Payment</h2>
              <button onClick={() => setShowPaymentSheet(false)} className="text-2xl">
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const amount = Number.parseInt(formData.get("amount") as string)
                const category = formData.get("category") as string
                const description = formData.get("description") as string

                const newTransaction = {
                  id: Date.now().toString(),
                  amount,
                  category: category as any,
                  description,
                  timestamp: new Date(),
                  saved: Math.floor(amount * 0.1),
                }

                setTransactions([newTransaction, ...transactions])
                notificationService.simulateTransaction(amount, category, description)
                setShowPaymentSheet(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  placeholder="0"
                  className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  required
                  className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select category</option>
                  <option value="bills">Bills</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="What did you spend on?"
                  className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentSheet(false)}
                  className="flex-1 py-3 border border-border rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
