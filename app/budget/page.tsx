"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, X, ShoppingBag, Utensils, Car, Zap, Film, AlertTriangle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

const categoryIcons: any = {
  "Food & Dining": Utensils,
  "Shopping": ShoppingBag,
  "Entertainment": Film,
  "Transportation": Car,
  "Bills": Zap,
}

const categoryColors: any = {
  "Food & Dining": "#10B981",
  "Shopping": "#F59E0B",
  "Entertainment": "#8B5CF6",
  "Transportation": "#3B82F6",
  "Bills": "#EF4444",
}

export default function BudgetPage() {
  const { status } = useSession()
  const router = useRouter()
  const [budgets, setBudgets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ category: "Food & Dining", amount: "" })

  const fetchBudgets = async () => {
    const res = await fetch("/api/budgets")
    const data = await res.json()
    setBudgets(data.budgets || [])
  }

  const fetchTransactions = async () => {
    const res = await fetch("/api/mono/transactions")
    const data = await res.json()
    const txns = data.data || []
    setTransactions(txns)
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") {
      fetchBudgets()
      fetchTransactions()
    }
  }, [status, router])

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    setShowModal(false)
    setFormData({ category: "Food & Dining", amount: "" })
    fetchBudgets()
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Delete this budget?")) return
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" })
    fetchBudgets()
  }

  if (status === "loading") return null

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth)

  const calculateSpent = (category: string) => {
    const monthStart = new Date(currentMonth + "-01").getTime()
    const monthEnd = new Date(new Date(monthStart).setMonth(new Date(monthStart).getMonth() + 1)).getTime()
    
    return transactions
      .filter(t => t.type === "debit" && t.category === category)
      .filter(t => {
        const txnDate = new Date(t.date).getTime()
        return txnDate >= monthStart && txnDate < monthEnd
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + calculateSpent(b.category), 0)
  const remainingBudget = totalBudget - totalSpent
  const isOverallOverBudget = remainingBudget < 0

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">Budget Manager</h1>
        <div className="w-6" />
      </div>

      {/* Overview Card */}
      <div className="px-4 pt-6 pb-3">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Total Budget This Month</p>
          <h2 className="text-4xl font-bold mb-4">NGN {totalBudget.toLocaleString()}</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-white/80">Spent</p>
              <p className="text-lg font-bold">NGN {totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80">{isOverallOverBudget ? "Over Budget" : "Remaining"}</p>
              <p className="text-lg font-bold">{isOverallOverBudget ? "-" : ""}NGN {Math.abs(remainingBudget).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Budget Button */}
      <div className="px-4 py-3">
        <button onClick={() => setShowModal(true)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Set Category Budget</p>
            <p className="text-xs text-white/80">Track spending by category</p>
          </div>
        </button>
      </div>

      {/* Budgets List */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Category Budgets</h3>
        {currentMonthBudgets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">No budgets set. Create your first budget!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentMonthBudgets.map((budget: any) => {
              const spent = calculateSpent(budget.category)
              const percentage = Math.round((spent / budget.amount) * 100)
              const isOverBudget = spent > budget.amount
              const Icon = categoryIcons[budget.category] || ShoppingBag
              const color = categoryColors[budget.category] || "#8B5CF6"

              return (
                <div key={budget._id.toString()} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm text-gray-900">{budget.category}</p>
                        {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                      <p className="text-xs text-gray-500">
                        NGN {spent.toLocaleString()} of NGN {budget.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full transition-all rounded-full" 
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`, 
                        backgroundColor: isOverBudget ? "#EF4444" : color 
                      }} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs font-semibold ${isOverBudget ? "text-red-600" : "text-gray-600"}`}>
                      {isOverBudget ? `Over by NGN ${(spent - budget.amount).toLocaleString()}` : `NGN ${(budget.amount - spent).toLocaleString()} left`}
                    </p>
                    <button onClick={() => handleDeleteBudget(budget._id)} className="text-xs text-red-600 font-semibold">
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Set Category Budget</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900">
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Bills">Bills</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Budget Amount (NGN)</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" placeholder="50000" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold">
                Set Budget
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
