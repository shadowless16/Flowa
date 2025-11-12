import { generateSmartReaction } from "./gemini-ai"
import { showLocalNotification } from "./push-notifications"

export async function sendPaymentNotification(
  amount: number,
  category: string,
  description: string,
  saved: number
) {
  const aiInsight = await generateSmartReaction(amount, category, description)
  
  const categoryEmojis: Record<string, string> = {
    "Food & Dining": "🍕",
    "Transportation": "🚗",
    "Shopping": "🛒",
    "Entertainment": "🎬",
    "Bills": "💳",
    "Other": "💰",
  }

  const emoji = categoryEmojis[category] || "💸"
  
  await showLocalNotification(
    `${emoji} ₦${amount.toLocaleString()} - ${category}`,
    `${description}\n\n💡 ${aiInsight}\n\n✨ +₦${saved.toLocaleString()} saved automatically!`,
    {
      image: '/icon-512x512.png',
      data: { amount, category, description, saved },
      actions: [
        { action: 'view', title: '📊 View Insights' },
        { action: 'save-more', title: '💰 Save More' },
      ],
    }
  )
}

export async function sendSavingsGoalNotification(
  goalName: string,
  current: number,
  target: number,
  percentage: number
) {
  const remaining = target - current
  const aiMessage = await generateGoalInsight(goalName, percentage, remaining)
  
  await showLocalNotification(
    `🎯 ${goalName} - ${percentage}% Complete!`,
    `₦${current.toLocaleString()} of ₦${target.toLocaleString()}\n\n💡 ${aiMessage}`,
    {
      image: '/icon-512x512.png',
      data: { goalName, current, target, percentage },
      actions: [
        { action: 'contribute', title: '💰 Add Funds' },
        { action: 'view', title: '📊 View Goal' },
      ],
    }
  )
}

export async function sendSpendingAlertNotification(
  category: string,
  spent: number,
  budget: number
) {
  const percentage = (spent / budget) * 100
  const emoji = percentage > 90 ? "🚨" : percentage > 75 ? "⚠️" : "📊"
  
  await showLocalNotification(
    `${emoji} ${category} Budget Alert`,
    `You've spent ₦${spent.toLocaleString()} of ₦${budget.toLocaleString()} (${Math.round(percentage)}%)\n\n💡 Consider reviewing your spending in this category.`,
    {
      image: '/icon-512x512.png',
      data: { category, spent, budget, percentage },
      actions: [
        { action: 'view-insights', title: '📊 View Breakdown' },
        { action: 'adjust-budget', title: '⚙️ Adjust Budget' },
      ],
    }
  )
}

async function generateGoalInsight(goalName: string, percentage: number, remaining: number): Promise<string> {
  if (percentage >= 90) {
    return `Almost there! Just ₦${remaining.toLocaleString()} more to reach your ${goalName} goal! 🎉`
  } else if (percentage >= 50) {
    return `Great progress! You're halfway to your ${goalName} goal. Keep it up! 💪`
  } else if (percentage >= 25) {
    return `You're making steady progress on ${goalName}. Every contribution counts! 🌟`
  } else {
    return `Starting strong with ${goalName}! Small steps lead to big achievements. 🚀`
  }
}
