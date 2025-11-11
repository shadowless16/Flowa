"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/split", label: "Split", icon: "👥" },
  { href: "/save", label: "Save", icon: "💰" },
  { href: "/insights", label: "Insights", icon: "📊" },
  { href: "/profile", label: "Profile", icon: "👤" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center h-20 z-40 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full text-xs gap-1 transition-colors",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
          )}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
