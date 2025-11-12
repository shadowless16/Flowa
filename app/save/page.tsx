"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Home, Plane, Car, Smartphone, Heart, GraduationCap, X, TrendingUp } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

const iconMap: any = { Home, Plane, Car, Smartphone, Heart, GraduationCap }
const iconOptions = [
  { name: "Home", icon: Home, color: "#8B5CF6" },
  { name: "Plane", icon: Plane, color: "#3B82F6" },
  { name: "Car", icon: Car, color: "#10B981" },
  { name: "Smartphone", icon: Smartphone, color: "#F59E0B" },
  { name: "Heart", icon: Heart, color: "#EF4444" },
  { name: "GraduationCap", icon: GraduationCap, color: "#8B5CF6" },
]

export default function SavePage() {
  const { status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", targetAmount: "", deadline: "", icon: "Home", color: "#8B5CF6", autoSaveRule: "" })
  const [contributeAmount, setContributeAmount] = useState("")

  const fetchGoals = async () => {
    const res = await fetch("/api/goals")
    const data = await res.json()
    setGoals(data.goals || [])
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchGoals()
  }, [status, router])

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    setShowModal(false)
    setFormData({ name: "", targetAmount: "", deadline: "", icon: "Home", color: "#8B5CF6", autoSaveRule: "" })
    fetchGoals()
  }

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/goals/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: selectedGoal._id, amount: Number(contributeAmount) }),
    })
    setShowContributeModal(false)
    setContributeAmount("")
    setSelectedGoal(null)
    fetchGoals()
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Delete this goal?")) return
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" })
    fetchGoals()
  }

  if (status === "loading") return null

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const completionRate = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          Auto-Save Goals 🔥
        </h1>
        <div className="w-6" />
      </div>

      {/* Main Goal Card */}
      <div className="px-4 pt-6 pb-2">
        <div className="gradient-savings rounded-3xl p-6 text-white shadow-lg">
          <div className="flex flex-col items-center">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mb-4">
              <svg className="transform -rotate-90" width="128" height="128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeDasharray="351.86"
                  strokeDashoffset={351.86 - (351.86 * completionRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold">{completionRate}%</p>
                <p className="text-xs text-white/80">Complete</p>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-1">Total Savings</p>
            <h2 className="text-4xl font-bold mb-1">₦{totalSaved.toLocaleString()}</h2>
            <p className="text-sm text-white/80">of ₦{totalTarget.toLocaleString()} target</p>
          </div>
        </div>
      </div>

      {/* Add New Goal Button */}
      <div className="px-4 py-3">
        <button onClick={() => setShowModal(true)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Add New Savings Goal</p>
            <p className="text-xs text-white/80">Set a target and start saving</p>
          </div>
        </button>
      </div>

      {/* Goals List */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Your Goals</h3>
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">No goals yet. Create your first savings goal!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal: any) => {
              const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100)
              const Icon = iconMap[goal.icon] || Home
              return (
                <div key={goal._id.toString()} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${goal.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-sm text-gray-900">{goal.name}</p>
                        <span className="text-sm font-bold" style={{ color: goal.color }}>{progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        ₦{goal.currentAmount.toLocaleString()} of ₦{goal.targetAmount.toLocaleString()}
                      </p>
                      {goal.autoSaveRule && (
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Auto-save: {goal.autoSaveRule}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full transition-all rounded-full" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedGoal(goal); setShowContributeModal(true) }} className="flex-1 bg-purple-50 text-purple-600 text-xs font-semibold py-2 rounded-xl hover:bg-purple-100">
                      Add Money
                    </button>
                    <button onClick={() => handleDeleteGoal(goal._id)} className="px-4 bg-red-50 text-red-600 text-xs font-semibold py-2 rounded-xl hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Savings Goal</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Goal Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" placeholder="e.g. New Car" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Target Amount (₦)</label>
                <input type="number" required value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" placeholder="100000" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Deadline (Optional)</label>
                <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((opt) => {
                    const IconComp = opt.icon
                    return (
                      <button key={opt.name} type="button" onClick={() => setFormData({ ...formData, icon: opt.name, color: opt.color })} className={`p-3 rounded-xl border-2 ${formData.icon === opt.name ? 'border-purple-500' : 'border-gray-200'}`}>
                        <IconComp className="w-6 h-6" style={{ color: opt.color }} />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Auto-Save Rule (Optional)</label>
                <select value={formData.autoSaveRule} onChange={(e) => setFormData({ ...formData, autoSaveRule: e.target.value })} className="w-full p-3 border rounded-xl text-gray-900">
                  <option value="">None</option>
                  <option value="Round-up transactions">Round-up transactions</option>
                  <option value="5% of income">5% of income</option>
                  <option value="10% of income">10% of income</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold">
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Money to {selectedGoal.name}</h2>
              <button onClick={() => setShowContributeModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Amount (₦)</label>
                <input type="number" required value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} className="w-full p-3 border rounded-xl text-lg text-gray-900" placeholder="5000" />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Current: ₦{selectedGoal.currentAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Target: ₦{selectedGoal.targetAmount.toLocaleString()}</p>
                <p className="text-sm font-semibold text-purple-600 mt-2">Remaining: ₦{(selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString()}</p>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold">
                Add Money
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
