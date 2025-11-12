"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Bell, CreditCard, Plus, Receipt, TrendingUp, Wallet } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const iconMap: any = { CreditCard, Wallet }

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [activeCard, setActiveCard] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [savingsGoal, setSavingsGoal] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    category: "",
    description: "",
  })
  const [visibleTransactions, setVisibleTransactions] = useState(6)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", () => {
      setActiveCard(emblaApi.selectedScrollSnap())
    })
  }, [emblaApi])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user").then((r) => r.json()).then(setUser)
      fetch("/api/goals").then((r) => r.json()).then((data) => {
        const monthlySavings = data.goals?.find((g: any) => g.name === "Monthly Savings")
        setSavingsGoal(monthlySavings || { targetAmount: 20000, currentAmount: 0 })
      })
      
      // Fetch balance and transactions from Mono
      Promise.all([
        fetch("/api/mono/balance").then((r) => r.json()),
        fetch("/api/mono/transactions").then((r) => r.json())
      ])
        .then(([balance, txData]) => {
          console.log("Balance:", balance)
          console.log("Transactions:", txData)
          
          if (balance.balance !== undefined && txData.data) {
            const transactions = txData.data || []
            const spending = transactions
              .filter((t: any) => t.type === "debit")
              .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
            const income = transactions
              .filter((t: any) => t.type === "credit")
              .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
            
            const totalBalance = balance.balance
            const savings = Math.floor(spending * 0.1) // 10% of spending goes to savings
            
            setCards([
              {
                id: 1,
                title: "Total Balance",
                amount: totalBalance,
                icon: "CreditCard",
                stats: [
                  { label: "Spending", value: spending },
                  { label: "Savings", value: savings },
                ],
              },
              {
                id: 2,
                title: "Available Cash",
                amount: totalBalance - spending,
                icon: "Wallet",
                stats: [
                  { label: "Income", value: income },
                  { label: "Expenses", value: spending },
                ],
              },
            ])
          } else {
            fetch("/api/cards").then((r) => r.json()).then(setCards)
          }
        })
        .catch((err) => {
          console.error("Error fetching Mono data:", err)
          fetch("/api/cards").then((r) => r.json()).then(setCards)
        })
    }
  }, [status])
  
  // Separate effect for transactions - combine Mono + manual payments
  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/mono/transactions").then((r) => r.json()),
        fetch("/api/payments").then((r) => r.json())
      ])
        .then(([monoData, paymentsData]) => {
          const monoTransactions = monoData.data ? monoData.data.map((t: any) => ({
            id: t._id,
            name: t.narration,
            category: t.category || "Other",
            amount: Math.abs(t.amount),
            saved: Math.floor(Math.abs(t.amount) * 0.1),
            time: new Date(t.date).toLocaleDateString(),
            icon: t.type === "credit" ? "💰" : "💸",
            bgColor: t.type === "credit" ? "bg-green-50" : "bg-red-50",
          })) : []
          
          const manualPayments = Array.isArray(paymentsData) ? paymentsData.map((p: any) => ({
            id: p._id,
            name: p.description,
            category: p.category,
            amount: p.amount,
            saved: p.saved,
            time: new Date(p.date).toLocaleDateString(),
            icon: getCategoryIcon(p.category),
            bgColor: "bg-blue-50",
          })) : []
          
          const allTransactions = [...manualPayments, ...monoTransactions]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          
          setTransactions(allTransactions.length > 0 ? allTransactions : [])
          
          if (allTransactions.length === 0) {
            fetch("/api/transactions").then((r) => r.json()).then(setTransactions)
          }
        })
        .catch(() => {
          fetch("/api/transactions").then((r) => r.json()).then(setTransactions)
        })
    }
  }, [status])
  
  const getCategoryIcon = (category: string) => {
    const icons: any = {
      "Food & Dining": "🍕",
      "Transportation": "🚗",
      "Shopping": "🛒",
      "Entertainment": "🎬",
      "Bills": "💳",
      "Other": "💰",
    }
    return icons[category] || "💸"
  }

  if (status === "loading" || !user || !cards.length || !transactions.length) return null

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-xs text-gray-500">Welcome back to Flowa</p>
        </div>
        <button onClick={() => router.push('/notifications')} className="relative">
          <Bell className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      {/* Balance Card Carousel */}
      <div className="pt-6 pb-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {cards.map((card, index) => {
              const Icon = iconMap[card.icon]
              return (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="gradient-primary rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-white/80 text-xs mb-1">{card.title}</p>
                        <h2 className="text-4xl font-bold">₦{card.amount.toLocaleString()}</h2>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {card.stats.map((stat: any, i: number) => (
                        <div key={i}>
                          <p className="text-white/70 text-xs mb-1">{stat.label}</p>
                          <p className="text-xl font-bold">₦{stat.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Card Indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                activeCard === index ? "bg-purple-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Monthly Goal */}
      {savingsGoal && (
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-600">Monthly Savings Goal</p>
              <p className="text-xs text-gray-500 mt-0.5">₦{savingsGoal.currentAmount.toLocaleString()} of ₦{savingsGoal.targetAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-500">{Math.round((savingsGoal.currentAmount / savingsGoal.targetAmount) * 100)}%</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${(savingsGoal.currentAmount / savingsGoal.targetAmount) * 100}%` }} />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-gray-600">💰</span>
            <p className="text-xs text-gray-600">₦{(savingsGoal.targetAmount - savingsGoal.currentAmount).toLocaleString()} more to reach your goal</p>
          </div>
        </div>
      </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setShowPaymentModal(true)} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Add Payment</span>
          </button>
          <button onClick={() => router.push('/split')} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Split Bill</span>
          </button>
          <button onClick={() => router.push('/insights')} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Insights</span>
          </button>
        </div>
      </div>

      {/* Recent Moments */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Moments</h3>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, visibleTransactions).map((txn) => (
            <div key={txn.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex gap-3">
                <div className={`w-10 h-10 ${txn.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{txn.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{txn.name}</p>
                      <p className="text-xs text-gray-500">{txn.category}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900">₦{txn.amount.toLocaleString()}</p>
                  </div>
                  {txn.badge ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{txn.badge}</span>
                      <span className="text-xs text-gray-400">{txn.time}</span>
                    </div>
                  ) : txn.saved > 0 ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">+₦{txn.saved} saved</span>
                      <span className="text-xs text-gray-400">{txn.time}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{txn.time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {visibleTransactions < transactions.length && (
          <button 
            onClick={() => setVisibleTransactions(prev => prev + 6)}
            className="w-full mt-4 py-3 bg-white rounded-2xl shadow-sm text-purple-600 font-semibold text-sm active:scale-95 transition-transform"
          >
            Show More
          </button>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowPaymentModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 active:scale-95 transition-transform hover:bg-purple-700"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                
                const response = await fetch("/api/payments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(paymentForm),
                })

                if (response.ok) {
                  setShowPaymentModal(false)
                  setPaymentForm({ amount: "", category: "", description: "" })
                  // Refresh transactions
                  window.location.reload()
                } else {
                  alert("Failed to add payment")
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={paymentForm.category}
                  onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Food & Dining">🍕 Food & Dining</option>
                  <option value="Transportation">🚗 Transportation</option>
                  <option value="Shopping">🛒 Shopping</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Bills">💳 Bills</option>
                  <option value="Other">💰 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
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
