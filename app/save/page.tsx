"use client"

import { useState } from "react"
import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { GradientCard } from "@/components/gradient-card"
import { mockGoals } from "@/lib/mock-data"

export default function SavePage() {
  const [goals, setGoals] = useState(mockGoals)
  const [showAddGoal, setShowAddGoal] = useState(false)

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0)
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0)
  const completionRate = Math.round((totalSaved / totalTarget) * 100)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
        <Link href="/" className="text-2xl">
          ←
        </Link>
        <h1 className="text-xl font-bold">Auto-Save Goals 🔥</h1>
        <button className="text-2xl">•••</button>
      </div>

      {/* Main Goal Card */}
      <div className="px-4 py-6">
        <GradientCard variant="savings">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 relative">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{completionRate}%</p>
                <p className="text-sm text-white/80">Complete</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Total Savings</h2>
            <p className="text-3xl font-bold mb-2">₦{totalSaved.toLocaleString()}</p>
            <p className="text-white/80 text-sm">of ₦{totalTarget.toLocaleString()} target</p>
          </div>
        </GradientCard>
      </div>

      {/* Add New Goal Button */}
      <div className="px-4 py-4">
        <button
          onClick={() => setShowAddGoal(true)}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-primary rounded-2xl text-primary font-semibold hover:bg-primary/5"
        >
          <span className="text-2xl">➕</span>
          Add New Savings Goal
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">Set a target and start saving</p>
      </div>

      {/* Goals List */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">Your Goals</h3>
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${goal.color}`}>{goal.icon}</div>
                    <div>
                      <p className="font-semibold text-sm">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₦{goal.current.toLocaleString()} of ₦{goal.target.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${goal.color} transition-all`} style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ₦{(goal.target - goal.current).toLocaleString()} remaining
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notifications/Achievements */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3">Recent Achievements</h3>
        <div className="space-y-2">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-3">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-xs font-semibold">You've ₦2,000 away from hitting your Rent Goal</p>
              <p className="text-xs text-muted-foreground">Keep going, you're almost there!</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-xs font-semibold">Great progress on your Emergency fund!</p>
              <p className="text-xs text-muted-foreground">Financial security is within reach.</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
