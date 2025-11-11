"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MoreVertical, Plus, Home, Plane, AlertCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function SavePage() {
  const goals = [
    {
      id: 1,
      name: "Rent Fund",
      current: 48000,
      target: 50000,
      icon: Home,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      barColor: "bg-blue-500",
    },
    {
      id: 2,
      name: "Vacation",
      current: 25500,
      target: 60000,
      icon: Plane,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      barColor: "bg-green-500",
    },
    {
      id: 3,
      name: "Emergency",
      current: 13950,
      target: 15000,
      icon: AlertCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      barColor: "bg-red-500",
    },
  ]

  const totalSaved = 87450
  const totalTarget = 125000
  const completionRate = 70

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
        <button>
          <MoreVertical className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Main Goal Card */}
      <div className="px-4 pt-6 pb-4">
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
      <div className="px-4 py-4">
        <button className="w-full bg-purple-50 rounded-2xl p-4 flex items-center gap-3 hover:bg-purple-100 transition-colors">
          <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Add New Savings Goal</p>
            <p className="text-xs text-gray-500">Set a target and start saving</p>
          </div>
        </button>
      </div>

      {/* Goals List */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Your Goals</h3>
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.round((goal.current / goal.target) * 100)
            const Icon = goal.icon
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 ${goal.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${goal.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm text-gray-900">{goal.name}</p>
                      <span className="text-sm font-bold text-blue-600">{progress}%</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      ₦{goal.current.toLocaleString()} of ₦{goal.target.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${goal.barColor} transition-all rounded-full`} style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-gray-500">
                  ₦{(goal.target - goal.current).toLocaleString()} remaining
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notifications/Achievements */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          <div className="bg-orange-50 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">You're ₦2,000 away from hitting your Rent Goal!</p>
              <p className="text-xs text-gray-600 mt-1">Keep going, you're almost there!</p>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Great progress on your Emergency fund!</p>
              <p className="text-xs text-gray-600 mt-1">Financial security is within reach.</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 flex gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">You've saved ₦12,450 this month!</p>
              <p className="text-xs text-gray-600 mt-1">That's 18% more than last month</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
