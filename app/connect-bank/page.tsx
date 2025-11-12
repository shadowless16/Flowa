"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Script from "next/script"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    MonoConnect: any
  }
}

export default function ConnectBankPage() {
  const router = useRouter()
  const { status } = useSession()
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])



  const connectBank = () => {
    console.log("Script loaded:", scriptLoaded)
    console.log("MonoConnect available:", typeof window.MonoConnect)
    console.log("Window object:", window)
    
    if (!scriptLoaded) {
      alert("Mono Connect is still loading. Please wait a moment and try again.")
      return
    }

    setLoading(true)
    
    try {
      // Try different ways to access MonoConnect
      const MonoConnect = window.MonoConnect || (window as any).Connect || (window as any).mono?.Connect
      
      if (!MonoConnect) {
        console.error("MonoConnect not found on window object")
        alert("Failed to initialize Mono Connect. Please refresh the page.")
        setLoading(false)
        return
      }
      
      const monoConnect = new MonoConnect({
        key: "test_pk_zfntx3oac34o90nbdf4b",
        onSuccess: async ({ code }: { code: string }) => {
          try {
            const response = await fetch("/api/mono/exchange-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            })

            const data = await response.json()

            if (response.ok) {
              console.log("Saving account ID:", data.id)
              const updateResponse = await fetch("/api/user/update-bank", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId: data.id, bankName: "ALAT by Wema" }),
              })
              const updateData = await updateResponse.json()
              console.log("Update response:", updateData)
              
              alert("Bank connected successfully!")
              router.push("/")
            } else {
              alert("Failed to connect bank: " + data.error)
            }
          } catch (error) {
            alert("Error connecting bank")
          } finally {
            setLoading(false)
          }
        },
        onClose: () => {
          setLoading(false)
        },
      })

      monoConnect.setup()
      monoConnect.open()
    } catch (error) {
      console.error("Error initializing Mono Connect:", error)
      alert("Failed to initialize bank connection. Please try again.")
      setLoading(false)
    }
  }

  if (status === "loading") return null

  return (
    <>
      <Script
        src="https://connect.withmono.com/connect.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Mono script loaded")
          setTimeout(() => {
            console.log("MonoConnect check:", typeof window.MonoConnect)
            console.log("Window keys:", Object.keys(window).filter(k => k.toLowerCase().includes('mono')))
            setScriptLoaded(true)
          }, 500)
        }}
        onError={() => console.error("Failed to load Mono script")}
      />
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏦</div>
            <h1 className="text-3xl font-bold text-white mb-2">Connect Your Bank</h1>
            <p className="text-white/80">
              Securely link your bank account to start tracking your finances
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <p className="text-sm">Bank-level security encryption</p>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <p className="text-sm">Read-only access to your data</p>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <p className="text-sm">Automatic transaction sync</p>
            </div>
          </div>

          <Button
            onClick={connectBank}
            disabled={loading || !scriptLoaded}
            className="w-full bg-white text-purple-900 hover:bg-white/90 py-6 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Connecting..." : !scriptLoaded ? "Loading..." : "Connect Bank Account"}
          </Button>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-4 text-white/80 hover:text-white text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
    </>
  )
}
