import type { Notification } from "./types"

export class NotificationService {
  private listeners: ((notification: Notification) => void)[] = []

  subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  emit(notification: Notification) {
    this.listeners.forEach((listener) => listener(notification))
  }

  simulateTransaction(amount: number, category: string, description: string) {
    const notification: Notification = {
      id: Date.now().toString(),
      type: "success",
      title: `${category.toUpperCase()} · ₦${amount.toLocaleString()}`,
      message: `${description} - ₦${Math.floor(amount * 0.1)} saved!`,
      icon: "✓",
      timestamp: new Date(),
    }
    this.emit(notification)
  }

  simulateAchievement(message: string) {
    const notification: Notification = {
      id: Date.now().toString(),
      type: "achievement",
      title: "Achievement Unlocked!",
      message,
      icon: "🎉",
      timestamp: new Date(),
    }
    this.emit(notification)
  }
}

export const notificationService = new NotificationService()
