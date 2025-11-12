"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Bar } from "react-chartjs-2"

function CategoryDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get("name")
  const [dailyData, setDailyData] = useState<any[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!category) return

    Promise.all([
      fetch("/api/mono/transactions").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json())
    ])
      .then(([monoData, paymentsData]) => {
        const monoTx = monoData.data || []
        const manualTx = Array.isArray(paymentsData) ? paymentsData : []
        
        const allTx = [
          ...monoTx.map((t: any) => ({
            amount: Math.abs(t.amount),
            category: t.category || "Other",
            date: new Date(t.date),
            description: t.narration
          })),
          ...manualTx.map((t: any) => ({
            amount: t.amount,
            category: t.category,
            date: new Date(t.date),
            description: t.description
          }))
        ].filter(t => t.category === category)

        const dailyMap: any = {}
        allTx.forEach(t => {
          const day = t.date.toLocaleDateString()
          if (!dailyMap[day]) {
            dailyMap[day] = { date: day, amount: 0, transactions: [] }
          }
          dailyMap[day].amount += t.amount
          dailyMap[day].transactions.push(t)
        })

        const sorted = Object.values(dailyMap).sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        setDailyData(sorted)
        setTotal(allTx.reduce((sum, t) => sum + t.amount, 0))
      })
  }, [category])

  if (!category) return null

  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/insights">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">{category}</h1>
      </div>

      <div className="px-4 pt-6 pb-4">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
          <p className="text-sm text-white/80 mb-1">Total Spent</p>
          <h2 className="text-4xl font-bold">₦{total.toLocaleString()}</h2>
          <p className="text-sm text-white/80 mt-2">{dailyData.length} days with activity</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Daily Breakdown</h3>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="h-64">
            <Bar
              data={{
                labels: dailyData.slice(0, 7).map((d: any) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                  data: dailyData.slice(0, 7).map((d: any) => d.amount),
                  backgroundColor: "#a855f7",
                  borderRadius: 8,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f0f0f0" },
                    ticks: { font: { size: 10 }, color: "#9ca3af", maxTicksLimit: 5 }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: "#9ca3af", maxRotation: 0 }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {dailyData.map((day: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-900">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p className="font-bold text-lg text-purple-600">₦{day.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                {day.transactions.map((tx: any, j: number) => (
                  <div key={j} className="flex justify-between items-center text-sm pl-3 border-l-2 border-purple-200">
                    <p className="text-gray-600">{tx.description}</p>
                    <p className="text-gray-900 font-medium">₦{tx.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <CategoryDetailContent />
    </Suspense>
  )
}
