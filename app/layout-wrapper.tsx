"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    const publicPaths = ["/auth/signin", "/auth/signup"]
    if (publicPaths.includes(pathname)) return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    const checkOnboarding = async () => {
      const res = await fetch("/api/user/onboarding-status")
      if (res.ok) {
        const { onboardingComplete, bankConnected } = await res.json()

        if (!onboardingComplete && pathname !== "/onboarding") {
          router.push("/onboarding")
        } else if (onboardingComplete && !bankConnected && pathname !== "/connect-bank") {
          router.push("/connect-bank")
        } else if (onboardingComplete && bankConnected && (pathname === "/onboarding" || pathname === "/connect-bank")) {
          router.push("/")
        }
      }
    }

    checkOnboarding()
  }, [session, status, pathname, router])

  return <>{children}</>
}
