"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface NotificationBannerProps {
  title: string
  message: string
  emoji: string
  onClose: () => void
}

export default function NotificationBanner({ title, message, emoji, onClose }: NotificationBannerProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!show) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-in slide-in-from-top">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-2xl">
        <button
          onClick={() => {
            setShow(false)
            setTimeout(onClose, 300)
          }}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-3 pr-8">
          <div className="text-3xl">{emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">{title}</h3>
            <p className="text-xs text-white/90 whitespace-pre-line">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
