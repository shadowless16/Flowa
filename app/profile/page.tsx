"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MoreVertical, ChevronRight, User, Link2, Settings, Bell, Shield, HelpCircle, LogOut, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<any>(null)
  const [goals, setGoals] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", phone: "" })
  const [settings, setSettings] = useState<any>(null)
  const [notifEnabled, setNotifEnabled] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") {
      fetch("/api/profile").then((r) => r.json()).then(setData)
      fetch("/api/profile/settings").then((r) => r.json()).then(setSettings)
      fetch("/api/goals").then((r) => r.json()).then(setGoals)
    }
  }, [status, router])

  useEffect(() => {
    if (data?.user) {
      setEditForm({ name: data.user.name, phone: data.user.phone || "" })
    }
  }, [data])

  useEffect(() => {
    if (settings?.notifications) {
      setNotifEnabled(settings.notifications.enabled)
    }
  }, [settings])

  const handleEditProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        toast({ title: "Profile updated successfully" })
        setEditOpen(false)
        fetch("/api/profile").then((r) => r.json()).then(setData)
      }
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" })
    }
  }

  const handleSavingsRules = async (roundUp: number, triggerAmount: number) => {
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "savingsRules", data: { roundUp, triggerAmount } }),
      })
      if (res.ok) {
        toast({ title: "Savings rules updated" })
        setSettingsOpen(false)
        fetch("/api/profile/settings").then((r) => r.json()).then(setSettings)
      }
    } catch (error) {
      toast({ title: "Failed to update settings", variant: "destructive" })
    }
  }

  const handleNotifToggle = async (enabled: boolean) => {
    setNotifEnabled(enabled)
    try {
      await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "notifications", data: { enabled, email: true, push: true } }),
      })
    } catch (error) {
      toast({ title: "Failed to update notifications", variant: "destructive" })
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  if (status === "loading" || !data || !settings || !goals) return null

  const { user, stats } = data
  const activeGoals = goals.goals?.filter((g: any) => g.currentAmount < g.targetAmount) || []
  const completedGoals = goals.goals?.filter((g: any) => g.currentAmount >= g.targetAmount) || []
  const totalGoalsSaved = goals.goals?.reduce((sum: number, g: any) => sum + g.currentAmount, 0) || 0
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
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-white/80">{user.email}</p>
              <p className="text-xs text-white/70 mt-1">{user.status}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">₦{((stats.totalSaved + totalGoalsSaved) / 1000).toFixed(0)}k</p>
              <p className="text-white/70 text-xs">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{activeGoals.length}</p>
              <p className="text-white/70 text-xs">Active Goals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{completedGoals.length}</p>
              <p className="text-white/70 text-xs">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-3">
        <MenuButton onClick={() => setEditOpen(true)} Icon={User} iconBg="bg-blue-100" iconColor="text-blue-600" title="Edit Profile" subtitle="Update name, phone" />
        <MenuButton onClick={() => router.push("/connect-bank")} Icon={Link2} iconBg="bg-green-100" iconColor="text-green-600" title="Connected Accounts" subtitle="Manage bank connections" badges={settings.connectedAccounts.length > 0 ? settings.connectedAccounts.map((acc: any) => ({ text: `${acc.bank} via ${acc.provider}`, color: "bg-green-50 text-green-600" })) : [{ text: "No accounts", color: "bg-gray-50 text-gray-600" }]} />
        <MenuButton onClick={() => setSettingsOpen(true)} Icon={Settings} iconBg="bg-purple-100" iconColor="text-purple-600" title="Savings Rules" subtitle="Round-up & trigger settings" info={`Round-up: ${settings.savingsRules.roundUp}% · Trigger: ₦${settings.savingsRules.triggerAmount}+`} />
        <MenuButton Icon={Bell} iconBg="bg-orange-100" iconColor="text-orange-600" title="Notification Preferences" subtitle="Alerts, reminders & updates" isToggle={true} toggleValue={notifEnabled} onToggle={handleNotifToggle} />
        <MenuButton onClick={() => setNotifOpen(true)} Icon={Shield} iconBg="bg-red-100" iconColor="text-red-600" title="Security & Privacy" subtitle="PIN, biometrics & data" />
        <MenuButton onClick={() => router.push("/notifications")} Icon={HelpCircle} iconBg="bg-indigo-100" iconColor="text-indigo-600" title="Help & Support" subtitle="FAQs, contact & feedback" />
      </div>

      {/* Sign Out Button */}
      <div className="px-4 py-4">
        <button onClick={handleSignOut} className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+234..." />
            </div>
            <Button onClick={handleEditProfile} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Savings Rules Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Savings Rules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Round-up Percentage (%)</Label>
              <Input type="number" defaultValue={settings.savingsRules.roundUp} id="roundUp" />
            </div>
            <div>
              <Label>Trigger Amount (₦)</Label>
              <Input type="number" defaultValue={settings.savingsRules.triggerAmount} id="triggerAmount" />
            </div>
            <Button onClick={() => {
              const roundUp = Number((document.getElementById("roundUp") as HTMLInputElement).value)
              const triggerAmount = Number((document.getElementById("triggerAmount") as HTMLInputElement).value)
              handleSavingsRules(roundUp, triggerAmount)
            }} className="w-full">Save Rules</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Security & Privacy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600">
            <p>Security features coming soon:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>PIN protection</li>
              <li>Biometric authentication</li>
              <li>Two-factor authentication</li>
              <li>Data privacy controls</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

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
  toggleValue,
  onToggle,
  onClick,
}: {
  Icon: any
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  badges?: { text: string; color: string }[]
  info?: string
  isToggle?: boolean
  toggleValue?: boolean
  onToggle?: (value: boolean) => void
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-2xl p-4 shadow-sm hover:bg-gray-50 flex items-center gap-3 text-left">
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
        <Switch checked={toggleValue} onCheckedChange={onToggle} className="flex-shrink-0" onClick={(e) => e.stopPropagation()} />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
  )
}
