import type { User, Transaction, SavingsGoal, Notification } from "./types"

export const mockUser: User = {
  id: "1",
  name: "Ak David",
  email: "akdavid@example.com",
  phone: "+234 801 234 5678",
  avatar: "🧑",
  totalSaved: 127000,
  totalSpent: 248200,
  successRate: 89,
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: 3200,
    category: "food",
    description: "KFC Restaurant",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    saved: 100,
  },
  {
    id: "2",
    amount: 4500,
    category: "entertainment",
    description: "Netflix Subscription",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    saved: 450,
  },
  {
    id: "3",
    amount: 15600,
    category: "shopping",
    description: "ShopRite Groceries",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    saved: 1560,
  },
]

export const mockGoals: SavingsGoal[] = [
  {
    id: "1",
    name: "Rent Fund",
    target: 150000,
    current: 144000,
    icon: "🏠",
    color: "bg-blue-500",
    daysLeft: 30,
  },
  {
    id: "2",
    name: "Vacation",
    target: 300000,
    current: 129000,
    icon: "✈️",
    color: "bg-green-500",
    daysLeft: 60,
  },
  {
    id: "3",
    name: "Emergency",
    target: 50000,
    current: 46500,
    icon: "🛡️",
    color: "bg-red-500",
    daysLeft: 15,
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "You've saved ₦2,000 away from hitting your Rent Goal",
    message: "Keep going, you're almost there!",
    icon: "🎉",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "2",
    type: "success",
    title: "Great progress on your Emergency fund!",
    message: "Financial security is within reach.",
    icon: "⭐",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]

export const categoryEmojis: Record<string, string> = {
  bills: "📄",
  entertainment: "🎬",
  shopping: "🛍️",
  food: "🍗",
  transport: "🚗",
  other: "📦",
}

export const spendingBreakdown = [
  { name: "Bills", value: 22.5, color: "#06b6d4" },
  { name: "Food & Dining", value: 18.2, color: "#a855f7" },
  { name: "Entertainment", value: 13.7, color: "#f59e0b" },
  { name: "Shopping", value: 70.4, color: "#ef4444" },
  { name: "Transport", value: 8.1, color: "#10b981" },
]
