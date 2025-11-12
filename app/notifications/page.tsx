"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bell, Sparkles } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { registerServiceWorker, requestNotificationPermission, showLocalNotification } from "@/lib/push-notifications"
import SimulateTransaction from "@/components/SimulateTransaction"

export default function NotificationsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showSimulator, setShowSimulator] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState<any>(null)
  const [simForm, setSimForm] = useState({ amount: "", narration: "", type: "debit", category: "Food & Dining" })
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications")
    const data = await res.json()
    setNotifications(data.notifications || [])
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") {
      fetchNotifications()
      registerServiceWorker()
      requestNotificationPermission()
    }
  }, [status, router])

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simForm),
      })
      const data = await res.json()
      console.log("Simulation result:", data)
      
      if (data.notification) {
        console.log("🔔 Triggering notification...")
        await showLocalNotification("💰 Smart Payment Alert", data.notification)
      }
    } catch (error) {
      console.error("Simulation error:", error)
    }
    setLoading(false)
    setShowSimulator(false)
    setSimForm({ amount: "", narration: "", type: "debit", category: "Food & Dining" })
    setTimeout(fetchNotifications, 1000)
  }

  if (status === "loading") return null

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex justify-between items-center">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">Smart Notifications</h1>
        <div className="flex gap-2">
          <button onClick={async () => {
            await showLocalNotification("Test Notification", "This is a test notification!")
          }} className="text-xs bg-gray-100 px-2 py-1 rounded">
            Test
          </button>
          <button onClick={() => setShowSimulator(true)}>
            <Sparkles className="w-6 h-6 text-purple-600" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        <SimulateTransaction />
        
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">Use the simulator above to test Mono notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <button key={notif._id} onClick={() => setSelectedNotif(notif)} className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-gray-900 mb-2">{notif.message}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {notif.transaction.type === "credit" ? "+" : "-"}NGN {notif.transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setSelectedNotif(null)}>
          <div className="bg-white rounded-t-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">AI Insight</p>
                <p className="text-base text-gray-900">{selectedNotif.message}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedNotif.transaction.type === "credit" ? "Income" : "Expense"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-semibold text-gray-900">NGN {selectedNotif.transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedNotif.transaction.narration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedNotif.transaction.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm font-semibold text-gray-900">{new Date(selectedNotif.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => setSelectedNotif(null)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSimulator && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Simulate Payment</h2>
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Type</label>
                <select value={simForm.type} onChange={(e) => setSimForm({ ...simForm, type: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900">
                  <option value="debit">Debit (Expense)</option>
                  <option value="credit">Credit (Income)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Amount (NGN)</label>
                <input type="number" required value={simForm.amount} onChange={(e) => setSimForm({ ...simForm, amount: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" placeholder="50000" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
                <input type="text" required value={simForm.narration} onChange={(e) => setSimForm({ ...simForm, narration: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" placeholder="Salary Payment" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                <select value={simForm.category} onChange={(e) => setSimForm({ ...simForm, category: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900">
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Bills">Bills</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSimulator(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                  {loading ? "Generating AI..." : "Simulate"}
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
