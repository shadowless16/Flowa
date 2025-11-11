"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, PiggyBank, TrendingUp, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/split", label: "Split", Icon: Users },
  { href: "/save", label: "Save", Icon: PiggyBank },
  { href: "/insights", label: "Insights", Icon: TrendingUp },
  { href: "/profile", label: "Profile", Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center h-20 z-40 md:hidden">
      {navItems.map((item) => {
        const Icon = item.Icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full text-xs gap-1 transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
