"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MoreVertical, TrendingUp, TrendingDown, Wallet, Calendar, PiggyBank, Receipt, UtensilsCrossed, ShoppingBag, Film, Car, CreditCard, DollarSign } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { Line, Bar } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function InsightsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") {
      // Fetch real transactions and calculate insights
      Promise.all([
        fetch("/api/mono/transactions").then((r) => r.json()),
        fetch("/api/payments").then((r) => r.json())
      ])
        .then(([monoData, paymentsData]) => {
          console.log("📊 Data source:", monoData.source || "unknown")
          const monoTx = monoData.data || []
          const manualTx = Array.isArray(paymentsData) ? paymentsData : []
          
          // Combine all transactions
          const allTx = [
            ...monoTx.map((t: any) => ({
              amount: Math.abs(t.amount),
              category: t.category || "Other",
              date: new Date(t.date),
              type: t.type
            })),
            ...manualTx.map((t: any) => ({
              amount: t.amount,
              category: t.category,
              date: new Date(t.date),
              type: "debit"
            }))
          ]
          
          // Calculate this week's spending
          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const thisWeekTx = allTx.filter(t => t.date >= weekAgo && t.type === "debit")
          const thisWeekAmount = thisWeekTx.reduce((sum, t) => sum + t.amount, 0)
          
          // Find top category
          const categoryTotals: any = {}
          thisWeekTx.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
          })
          const topCategory = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1])[0]
          
          // Calculate spending breakdown
          const totalSpending = allTx.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)
          const breakdown = Object.entries(
            allTx.filter(t => t.type === "debit").reduce((acc: any, t) => {
              acc[t.category] = (acc[t.category] || 0) + t.amount
              return acc
            }, {})
          ).map(([name, amount]: any) => ({
            name,
            value: ((amount / totalSpending) * 100).toFixed(1),
            color: getCategoryColor(name)
          }))
          
          // Calculate savings over time (last 8 weeks)
          const weeks = []
          for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
            const weekTx = allTx.filter(t => t.date >= weekStart && t.date < weekEnd && t.type === "debit")
            const weekSpending = weekTx.reduce((sum, t) => sum + t.amount, 0)
            weeks.push({
              name: `Week ${8 - i}`,
              value: Math.floor(weekSpending * 0.1) // 10% saved
            })
          }
          
          // Calculate average daily spend
          const daysWithTx = new Set(allTx.filter(t => t.type === "debit").map(t => t.date.toDateString())).size
          const avgDaily = daysWithTx > 0 ? Math.floor(totalSpending / daysWithTx) : 0
          
          // Find most expensive day
          const dailyTotals: any = {}
          allTx.filter(t => t.type === "debit").forEach(t => {
            const day = t.date.toLocaleDateString('en-US', { weekday: 'long' })
            dailyTotals[day] = (dailyTotals[day] || 0) + t.amount
          })
          const mostExpensiveDay = Object.entries(dailyTotals).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "N/A"
          
          // Calculate monthly comparison
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          const thisMonthTx = allTx.filter(t => t.date >= monthAgo && t.type === "debit")
          const lastMonthTx = allTx.filter(t => t.date >= twoMonthsAgo && t.date < monthAgo && t.type === "debit")
          const thisMonthTotal = thisMonthTx.reduce((sum, t) => sum + t.amount, 0)
          const lastMonthTotal = lastMonthTx.reduce((sum, t) => sum + t.amount, 0)
          const monthChange = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0
          
          // Top categories with details
          const catDetails = Object.entries(categoryTotals).map(([name, amount]: any) => ({
            name,
            amount,
            count: allTx.filter(t => t.category === name && t.type === "debit").length,
            percentage: ((amount / totalSpending) * 100).toFixed(1),
            iconName: name // Store category name to get icon later
          })).sort((a, b) => b.amount - a.amount).slice(0, 5)
          
          setData({
            thisWeek: {
              amount: thisWeekAmount,
              topCategory: topCategory?.[0] || "Other",
              topCategoryAmount: topCategory?.[1] || 0
            },
            savingsUp: {
              percentage: 8,
              label: "vs Last Week"
            },
            spendingBreakdown: breakdown,
            savingsOverTime: weeks,
            quickStats: {
              averageDailySpend: avgDaily,
              mostExpensiveDay,
              totalSaved: Math.floor(totalSpending * 0.1),
              totalTransactions: allTx.filter(t => t.type === "debit").length,
              thisMonth: thisMonthTotal,
              lastMonth: lastMonthTotal,
              monthChange,
              topCategories: catDetails
            }
          })
        })
        .catch(() => {
          fetch("/api/insights").then((r) => r.json()).then(setData)
        })
    }
  }, [status, router])
  
  const getCategoryColor = (category: string) => {
    const colors: any = {
      "Food & Dining": "#a855f7",
      "Food": "#a855f7",
      "Shopping": "#ef4444",
      "Entertainment": "#f59e0b",
      "Transportation": "#10b981",
      "Transport": "#10b981",
      "Bills": "#06b6d4",
      "Other": "#8b5cf6"
    }
    return colors[category] || "#6366f1"
  }
  
  const getCategoryIcon = (category: string) => {
    const icons: any = {
      "Food & Dining": UtensilsCrossed,
      "Food": UtensilsCrossed,
      "Shopping": ShoppingBag,
      "Entertainment": Film,
      "Transportation": Car,
      "Transport": Car,
      "Bills": CreditCard,
      "Other": DollarSign
    }
    return icons[category] || Receipt
  }

  if (status === "loading" || !data) return null

  const { thisWeek, savingsUp, spendingBreakdown, savingsOverTime, quickStats } = data

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
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

      <div className="px-4 pt-6 pb-4">
        <div className="gradient-primary rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-white/90">This Week</span>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-1">₦{thisWeek.amount.toLocaleString()}</h2>
          <p className="text-sm text-white/80">Total spent</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs text-gray-600">Top Category</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{thisWeek.topCategory}</p>
            <p className="text-sm text-gray-500">₦{thisWeek.topCategoryAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Savings Up</span>
            </div>
            <p className="text-xl font-bold text-green-600">+{savingsUp.percentage}%</p>
            <p className="text-xs text-gray-500">{savingsUp.label}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Spending Breakdown</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-64">
            <Bar
              data={{
                labels: spendingBreakdown.map((d: any) => d.name),
                datasets: [
                  {
                    data: spendingBreakdown.map((d: any) => d.value),
                    backgroundColor: spendingBreakdown.map((d: any) => d.color),
                    borderRadius: 8,
                    barThickness: 40,
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
                    ticks: { 
                      font: { size: 10 }, 
                      color: "#9ca3af",
                      callback: (value) => value + "%"
                    },
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

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Savings Over Time</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-52">
            <Line
              data={{
                labels: savingsOverTime.map((d: any) => d.name),
                datasets: [
                  {
                    data: savingsOverTime.map((d: any) => d.value),
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

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-500">Avg Daily</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₦{quickStats.averageDailySpend.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <p className="text-xs text-gray-500">Top Day</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{quickStats.mostExpensiveDay}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-500">Total Saved</p>
            </div>
            <p className="text-2xl font-bold text-green-600">₦{quickStats.totalSaved.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{quickStats.totalTransactions}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Category Breakdown</h3>
        <div className="space-y-3">
          {quickStats.topCategories?.map((cat: any, i: number) => {
            const Icon = getCategoryIcon(cat.iconName)
            return (
            <Link key={i} href={`/insights/category?name=${encodeURIComponent(cat.name)}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-base text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-500">{cat.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">₦{cat.amount.toLocaleString()}</p>
                    <p className="text-sm text-purple-600 font-semibold">{cat.percentage}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            </Link>
          )
          })}
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Monthly Comparison</h3>
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-base text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">₦{quickStats.thisMonth.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-base text-gray-600">Last Month</p>
            <p className="text-2xl font-bold text-gray-500">₦{quickStats.lastMonth.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <p className="text-base font-semibold text-gray-900">Change</p>
            <p className={`text-2xl font-bold ${quickStats.monthChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {quickStats.monthChange >= 0 ? '+' : ''}{quickStats.monthChange}%
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
