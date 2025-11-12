import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    thisWeek: {
      amount: 14200,
      topCategory: "Food",
      topCategoryAmount: 5800,
    },
    savingsUp: {
      percentage: 8,
      label: "vs Last Week",
    },
    spendingBreakdown: [
      { name: "Food", value: 40.2, color: "#a855f7" },
      { name: "Shopping", value: 20.4, color: "#ef4444" },
      { name: "Entertainment", value: 15.7, color: "#f59e0b" },
      { name: "Transport", value: 11.2, color: "#10b981" },
      { name: "Bills", value: 12.5, color: "#06b6d4" },
    ],
    savingsOverTime: [
      { name: "Week 1", value: 8500 },
      { name: "Week 2", value: 7200 },
      { name: "Week 3", value: 9100 },
      { name: "Week 4", value: 8800 },
      { name: "Week 5", value: 9500 },
      { name: "Week 6", value: 10200 },
    ],
    quickStats: {
      averageDailySpend: 2028,
      mostExpensiveDay: "Thursday",
    },
  })
}
