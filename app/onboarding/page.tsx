"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    emoji: "💰",
    title: "Transform every payment into progress",
    description: "Watch your savings grow automatically with every transaction you make",
  },
  {
    emoji: "🧠",
    title: "Split bills with friends, save smartly",
    description: "Share expenses effortlessly and keep track of who owes what",
  },
  {
    emoji: "🚀",
    title: "Stay in control of your spending",
    description: "Get insights and analytics to make better financial decisions",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { status } = useSession()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/onboarding-status")
        .then(r => r.json())
        .then(({ onboardingComplete, bankConnected }) => {
          if (onboardingComplete && bankConnected) {
            router.push("/")
          } else if (onboardingComplete && !bankConnected) {
            router.push("/connect-bank")
          }
        })
    }
  }, [status, router])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", () => {
      setCurrentSlide(emblaApi.selectedScrollSnap())
    })
  }, [emblaApi])

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      emblaApi?.scrollNext()
    } else {
      await fetch("/api/user/complete-onboarding", { method: "POST" })
      router.push("/connect-bank")
    }
  }

  const handleSkip = async () => {
    await fetch("/api/user/complete-onboarding", { method: "POST" })
    router.push("/connect-bank")
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-end p-6">
        <button onClick={handleSkip} className="text-gray-600 hover:text-gray-900 font-medium">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((slide, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-8xl mb-8">{slide.emoji}</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{slide.title}</h2>
                    <p className="text-gray-600 text-lg">{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-12 mb-8">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-purple-600" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-purple-600 text-white hover:bg-purple-700 py-6 rounded-xl font-semibold text-lg transition-all"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  )
}
