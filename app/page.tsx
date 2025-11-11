"use client"

import { useState } from "react"
import { Bell, CreditCard, Plus, Receipt, TrendingUp, Wallet } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [activeCard, setActiveCard] = useState(0)

  const cards = [
    {
      title: "Total Balance",
      amount: 245680,
      icon: CreditCard,
      stats: [
        { label: "Spending", value: 48200 },
        { label: "Savings", value: 12450 },
      ],
    },
    {
      title: "Available Cash",
      amount: 197480,
      icon: Wallet,
      stats: [
        { label: "Income", value: 250000 },
        { label: "Expenses", value: 52520 },
      ],
    },
  ]

  useState(() => {
    if (!emblaApi) return
    emblaApi.on("select", () => {
      setActiveCard(emblaApi.selectedScrollSnap())
    })
  })

  const transactions = [
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
  ]

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Hi, Ak David 👋</h1>
          <p className="text-xs text-gray-500">Welcome back to Payverse</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell className="w-5 h-5 text-purple-600" />
          </button>
          <Avatar className="w-9 h-9">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Balance Card Carousel */}
      <div className="pt-6 pb-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="gradient-primary rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-white/80 text-xs mb-1">{card.title}</p>
                        <h2 className="text-4xl font-bold">₦{card.amount.toLocaleString()}</h2>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {card.stats.map((stat, i) => (
                        <div key={i}>
                          <p className="text-white/70 text-xs mb-1">{stat.label}</p>
                          <p className="text-xl font-bold">₦{stat.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Card Indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                activeCard === index ? "bg-purple-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Monthly Goal */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-600">Monthly Savings Goal</p>
              <p className="text-xs text-gray-500 mt-0.5">₦15,450 of ₦20,000</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-500">62%</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: "62%" }} />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-gray-600">💰</span>
            <p className="text-xs text-gray-600">₦4,550 more to reach your goal</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Add Payment</span>
          </button>
          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Split Bill</span>
          </button>
          <button className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Insights</span>
          </button>
        </div>
      </div>

      {/* Recent Moments */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Moments</h3>
          <button className="text-xs text-purple-600 font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex gap-3">
                <div className={`w-10 h-10 ${txn.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">{txn.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{txn.name}</p>
                      <p className="text-xs text-gray-500">{txn.category}</p>
                    </div>
                    <p className="font-bold text-sm text-gray-900">₦{txn.amount.toLocaleString()}</p>
                  </div>
                  {txn.badge ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">{txn.badge}</span>
                      <span className="text-xs text-gray-400">{txn.time}</span>
                    </div>
                  ) : txn.saved > 0 ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">+₦{txn.saved} saved</span>
                      <span className="text-xs text-gray-400">{txn.time}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">{txn.time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 active:scale-95 transition-transform">
        <Plus className="w-6 h-6" />
      </button>

      <BottomNav />
    </main>
  )
}
