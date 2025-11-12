import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      title: "Total Balance",
      amount: 245680,
      icon: "CreditCard",
      stats: [
        { label: "Spending", value: 48200 },
        { label: "Savings", value: 12450 },
      ],
    },
    {
      id: 2,
      title: "Available Cash",
      amount: 197480,
      icon: "Wallet",
      stats: [
        { label: "Income", value: 250000 },
        { label: "Expenses", value: 52520 },
      ],
    },
  ])
}
