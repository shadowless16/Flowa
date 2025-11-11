export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  totalSaved: number
  totalSpent: number
  successRate: number
}

export interface Transaction {
  id: string
  amount: number
  category: "bills" | "entertainment" | "shopping" | "food" | "transport" | "other"
  description: string
  timestamp: Date
  saved?: number
  aiReaction?: string
}

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  icon: string
  color: string
  daysLeft?: number
}

export interface Split {
  id: string
  amount: number
  description: string
  participants: { name: string; share: number }[]
  createdAt: Date
  status: "pending" | "completed"
}

export interface Notification {
  id: string
  type: "success" | "warning" | "info" | "achievement"
  title: string
  message: string
  icon: string
  timestamp: Date
}
