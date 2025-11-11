"use client"

import Link from "next/link"
import { BottomNav } from "@/components/bottom-nav"
import { mockUser } from "@/lib/mock-data"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
        <Link href="/" className="text-2xl">
          ←
        </Link>
        <h1 className="text-xl font-bold">Profile & Settings</h1>
        <button className="text-2xl">•••</button>
      </div>

      {/* Profile Card */}
      <div className="px-4 py-6">
        <div className="gradient-primary rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">🧑</div>
            <div>
              <h2 className="text-2xl font-bold">{mockUser.name}</h2>
              <p className="text-sm text-white/70">{mockUser.email}</p>
              <p className="text-xs text-white/60 mt-1">Active Member</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/70 text-xs mb-1">Total Saved</p>
              <p className="text-lg font-bold">₦{mockUser.totalSaved.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">Goals</p>
              <p className="text-lg font-bold">42</p>
            </div>
            <div>
              <p className="text-white/70 text-xs mb-1">Success Rate</p>
              <p className="text-lg font-bold">{mockUser.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6 space-y-3">
        <MenuButton icon="✎" title="Edit Profile" subtitle="Update name, photo, email" />
        <MenuButton icon="🔗" title="Connected Accounts" subtitle="Manage bank connections" />
        <MenuButton icon="⚙️" title="Savings Rules" subtitle="Round-up & trigger settings" />
        <MenuButton icon="🔔" title="Notification Preferences" subtitle="Alerts, reminders & updates" isToggle={true} />
        <MenuButton icon="🔐" title="Security & Privacy" subtitle="PIN, biometrics & data" />
        <MenuButton icon="❓" title="Help & Support" subtitle="FAQs, contact & feedback" />
      </div>

      {/* Sign Out Button */}
      <div className="px-4 py-4">
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
          <span>👋</span> Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 text-center">
        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
          <span className="text-3xl block mb-2">💜</span>
          <p className="text-xs font-semibold text-purple-900">Built for the Wema Bank Hackathon</p>
          <p className="text-xs text-purple-700 mt-1">Making payments social, intelligent, and valuable</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

function MenuButton({
  icon,
  title,
  subtitle,
  isToggle = false,
}: {
  icon: string
  title: string
  subtitle: string
  isToggle?: boolean
}) {
  return (
    <button className="w-full bg-white rounded-2xl p-4 shadow-sm hover:bg-gray-50 flex items-center justify-between text-left">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {isToggle ? (
        <div className="w-10 h-6 bg-primary rounded-full flex items-center p-1">
          <div className="w-4 h-4 bg-white rounded-full ml-auto" />
        </div>
      ) : (
        <span className="text-xl">→</span>
      )}
    </button>
  )
}
