"use client"

import Link from "next/link"
import { ArrowLeft, MoreVertical, TrendingUp, TrendingDown } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { Line, Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function InsightsPage() {
  const savingsData = [
    { name: "Week 1", value: 8500 },
    { name: "Week 2", value: 7200 },
    { name: "Week 3", value: 9100 },
    { name: "Week 4", value: 8800 },
    { name: "Week 5", value: 9500 },
    { name: "Week 6", value: 10200 },
  ]

  const spendingBreakdown = [
    { name: "Food", value: 40.2, color: "#a855f7" },
    { name: "Shopping", value: 20.4, color: "#ef4444" },
    { name: "Entertainment", value: 15.7, color: "#f59e0b" },
    { name: "Transport", value: 11.2, color: "#10b981" },
    { name: "Bills", value: 12.5, color: "#06b6d4" },
  ]

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          Spending Insights 📊
        </h1>
        <button>
          <MoreVertical className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* This Week Card */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <span className="text-sm text-white/90">This Week</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-1">₦14,200</h2>
          <p className="text-sm text-white/80">Total spent</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">🍕</span>
              </div>
              <span className="text-xs text-gray-600">Top Category</span>
            </div>
            <p className="text-xl font-bold text-gray-900">Food</p>
            <p className="text-xs text-gray-500">₦5,800</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Savings Up</span>
            </div>
            <p className="text-xl font-bold text-green-600">+8%</p>
            <p className="text-xs text-gray-500">vs Last Week</p>
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Spending Breakdown</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="w-64 h-64 mx-auto">
            <Doughnut
              data={{
                labels: ["Food", "Shopping", "Entertainment", "Transport", "Bills"],
                datasets: [
                  {
                    data: [40.2, 20.4, 15.7, 11.2, 12.5],
                    backgroundColor: ["#a855f7", "#ef4444", "#f59e0b", "#10b981", "#06b6d4"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 15,
                      font: { size: 11 },
                      generateLabels: (chart) => {
                        const data = chart.data
                        return data.labels?.map((label, i) => ({
                          text: `${label} ${data.datasets[0].data[i]}%`,
                          fillStyle: data.datasets[0].backgroundColor?.[i] as string,
                          hidden: false,
                          index: i,
                        })) || []
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Savings Over Time */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Savings Over Time</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-52">
            <Line
              data={{
                labels: savingsData.map((d) => d.name),
                datasets: [
                  {
                    data: savingsData.map((d) => d.value),
                    borderColor: "#a855f7",
                    backgroundColor: "rgba(168, 85, 247, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: "#a855f7",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f0f0f0" },
                    ticks: { font: { size: 10 }, color: "#9ca3af" },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: "#9ca3af" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Quick Stats</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Average Daily Spend</p>
              <p className="text-xl font-bold text-gray-900">₦2,028</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Most Expensive Day</p>
              <p className="text-xl font-bold text-gray-900">Thursday</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
