"use client"

import Link from "next/link"
import { ArrowLeft, MoreVertical, ChevronRight, User, Link2, Settings, Bell, Shield, HelpCircle, LogOut } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-4 flex justify-between items-center">
        <Link href="/">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="text-base font-semibold text-gray-900">Profile & Settings</h1>
        <button>
          <MoreVertical className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="px-4 pt-6 pb-4">
        <div className="gradient-primary rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-14 h-14 border-2 border-white/30">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Ak David</h2>
              <p className="text-sm text-white/80">akdavid@example.com</p>
              <p className="text-xs text-white/70 mt-1">Active Member</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">₦127k</p>
              <p className="text-white/70 text-xs">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">42</p>
              <p className="text-white/70 text-xs">Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-white/70 text-xs">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-3">
        <MenuButton Icon={User} iconBg="bg-blue-100" iconColor="text-blue-600" title="Edit Profile" subtitle="Update name, photo, email" />
        <MenuButton Icon={Link2} iconBg="bg-green-100" iconColor="text-green-600" title="Connected Accounts" subtitle="Manage bank connections" badges={[{ text: "Mono Connected", color: "bg-red-50 text-red-600" }, { text: "Okra Pending", color: "bg-blue-50 text-blue-600" }]} />
        <MenuButton Icon={Settings} iconBg="bg-purple-100" iconColor="text-purple-600" title="Savings Rules" subtitle="Round-up & trigger settings" info="Round-up: 5% · Trigger: ₦500+" />
        <MenuButton Icon={Bell} iconBg="bg-orange-100" iconColor="text-orange-600" title="Notification Preferences" subtitle="Alerts, reminders & updates" isToggle={true} />
        <MenuButton Icon={Shield} iconBg="bg-red-100" iconColor="text-red-600" title="Security & Privacy" subtitle="PIN, biometrics & data" />
        <MenuButton Icon={HelpCircle} iconBg="bg-indigo-100" iconColor="text-indigo-600" title="Help & Support" subtitle="FAQs, contact & feedback" />
      </div>

      {/* Sign Out Button */}
      <div className="px-4 py-4">
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">💜</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">Built for the Wema Bank Hackathon</p>
          <p className="text-xs text-purple-600 mt-1">Making payments social, intelligent, and valuable</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

function MenuButton({
  Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badges,
  info,
  isToggle = false,
}: {
  Icon: any
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  badges?: { text: string; color: string }[]
  info?: string
  isToggle?: boolean
}) {
  return (
    <button className="w-full bg-white rounded-2xl p-4 shadow-sm hover:bg-gray-50 flex items-center gap-3 text-left">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
        {badges && (
          <div className="flex gap-2 mt-2">
            {badges.map((badge, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded ${badge.color}`}>
                • {badge.text}
              </span>
            ))}
          </div>
        )}
        {info && (
          <p className="text-xs text-gray-500 mt-1">{info}</p>
        )}
      </div>
      {isToggle ? (
        <Switch defaultChecked className="flex-shrink-0" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
  )
}
