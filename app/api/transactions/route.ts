import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: "KFC Restaurant",
      category: "Food & Dining",
      amount: 200,
      saved: 850,
      time: "2 hours ago",
      icon: "🍗",
      bgColor: "bg-red-50",
    },
    {
      id: 2,
      name: "Total Energies",
      category: "Transportation",
      amount: 8500,
      saved: 0,
      time: "Yesterday",
      icon: "⛽",
      bgColor: "bg-pink-50",
    },
    {
      id: 3,
      name: "Netflix Subscription",
      category: "Entertainment",
      amount: 4500,
      saved: 0,
      time: "2 days ago",
      icon: "📺",
      bgColor: "bg-purple-50",
      badge: "Split with 3 Friends",
    },
    {
      id: 4,
      name: "ShopRite Groceries",
      category: "Shopping",
      amount: 15600,
      saved: 0,
      time: "3 days ago",
      icon: "🛒",
      bgColor: "bg-teal-50",
    },
  ])
}
