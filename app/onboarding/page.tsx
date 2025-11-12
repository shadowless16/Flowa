"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import useEmblaCarousel from "embla-carousel-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Check } from "lucide-react"

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
  {
    emoji: "📊",
    title: "What do you spend on daily?",
    description: "Select categories you commonly spend on. This helps us categorize your transactions quickly.",
    isCategories: true,
  },
]

const defaultCategories = [
  { id: "food", name: "Food & Dining", emoji: "🍽️" },
  { id: "transport", name: "Transportation", emoji: "🚗" },
  { id: "bills", name: "Bills & Utilities", emoji: "💡" },
  { id: "shopping", name: "Shopping", emoji: "🛍️" },
  { id: "entertainment", name: "Entertainment", emoji: "🎬" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { status } = useSession()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState("")
  const [customCategories, setCustomCategories] = useState<string[]>([])

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
      const allCategories = [...selectedCategories, ...customCategories]
      await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCategories: allCategories })
      })
      router.push("/connect-bank")
    }
  }

  const handleSkip = async () => {
    await fetch("/api/user/complete-onboarding", { method: "POST" })
    router.push("/connect-bank")
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const addCustomCategory = () => {
    if (customCategory.trim() && !customCategories.includes(customCategory.trim())) {
      setCustomCategories(prev => [...prev, customCategory.trim()])
      setCustomCategory("")
    }
  }

  const removeCustomCategory = (category: string) => {
    setCustomCategories(prev => prev.filter(c => c !== category))
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
                  {slide.isCategories ? (
                    <div className="flex flex-col">
                      <div className="text-center mb-6">
                        <div className="text-6xl mb-4">{slide.emoji}</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.title}</h2>
                        <p className="text-gray-600">{slide.description}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          {defaultCategories.map((category) => (
                            <Card 
                              key={category.id}
                              className={`p-4 cursor-pointer transition-all ${
                                selectedCategories.includes(category.id) 
                                  ? "border-purple-500 bg-purple-50" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => toggleCategory(category.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{category.emoji}</span>
                                  <span className="font-medium">{category.name}</span>
                                </div>
                                {selectedCategories.includes(category.id) && (
                                  <Check className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add custom category..."
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                            />
                            <Button 
                              onClick={addCustomCategory}
                              variant="outline"
                              size="icon"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {customCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {customCategories.map((category) => (
                                <Badge 
                                  key={category}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeCustomCategory(category)}
                                >
                                  {category} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="text-8xl mb-8">{slide.emoji}</div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">{slide.title}</h2>
                      <p className="text-gray-600 text-lg">{slide.description}</p>
                    </div>
                  )}
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
