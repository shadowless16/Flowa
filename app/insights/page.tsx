"use client"

import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { spendingBreakdown } from "@/lib/mock-data"

export default function InsightsPage() {
  const weeklyData = [
    { week: "Week 1", amount: 35000 },
    { week: "Week 2", amount: 42000 },
    { week: "Week 3", amount: 38000 },
    { week: "Week 4", amount: 45000 },
    { week: "Week 5", amount: 52000 },
  ]

  const maxAmount = Math.max(...weeklyData.map((d) => d.amount))

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
        <Link href="/" className="text-2xl">
          ←
        </Link>
        <h1 className="text-xl font-bold">Spending Insights 📊</h1>
        <button className="text-2xl">•••</button>
      </div>

      {/* This Week Card */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-white/80 text-sm mb-2">This Week</p>
              <h2 className="text-4xl font-bold">₦14,200</h2>
            </div>
            <span className="text-3xl">📊</span>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-2">Total spent</p>
            <p className="text-xs">Top category: Shopping</p>
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold mb-4">Spending Breakdown</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Pie Chart Visualization */}
          <div className="flex items-center justify-center mb-6">
            <div
              className="relative w-40 h-40 rounded-full"
              style={{
                background: `conic-gradient(
                #06b6d4 0% ${spendingBreakdown[0].value}%,
                #a855f7 ${spendingBreakdown[0].value}% ${spendingBreakdown[0].value + spendingBreakdown[1].value}%,
                #f59e0b ${spendingBreakdown[0].value + spendingBreakdown[1].value}% ${spendingBreakdown[0].value + spendingBreakdown[1].value + spendingBreakdown[2].value}%,
                #ef4444 ${spendingBreakdown[0].value + spendingBreakdown[1].value + spendingBreakdown[2].value}% ${spendingBreakdown[0].value + spendingBreakdown[1].value + spendingBreakdown[2].value + spendingBreakdown[3].value}%,
                #10b981 ${spendingBreakdown[0].value + spendingBreakdown[1].value + spendingBreakdown[2].value + spendingBreakdown[3].value}% 100%
              )`,
              }}
            >
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {spendingBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Over Time Chart */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold mb-4">Savings Over Time</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Bar Chart */}
          <div className="flex items-end justify-between h-40 gap-2 mb-6">
            {weeklyData.map((data) => (
              <div key={data.week} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-purple-400 to-purple-500 rounded-t-lg"
                  style={{ height: `${(data.amount / maxAmount) * 120}px` }}
                />
                <span className="text-xs text-muted-foreground text-center">{data.week}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">Weekly savings trend</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-6">
        <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary">₦14,200</p>
            <p className="text-xs text-muted-foreground mt-1">Spent This Week</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">₦1,420</p>
            <p className="text-xs text-muted-foreground mt-1">Saved This Week</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
