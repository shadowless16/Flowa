"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", () => {
      setCurrentSlide(emblaApi.selectedScrollSnap())
    })
  }, [emblaApi])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      emblaApi?.scrollNext()
    } else {
      router.push("/connect-bank")
    }
  }

  const handleSkip = () => {
    router.push("/connect-bank")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex flex-col">
      <div className="flex justify-end p-6">
        <button onClick={handleSkip} className="text-white/80 hover:text-white font-medium">
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
                    <h2 className="text-3xl font-bold text-white mb-4">{slide.title}</h2>
                    <p className="text-white/80 text-lg">{slide.description}</p>
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
                  currentSlide === index ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-white text-purple-900 hover:bg-white/90 py-6 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  )
}
