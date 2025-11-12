const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

export async function generateSmartReaction(amount: number, category: string, description: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getMockReaction(category, amount)
  }

  try {
    const prompt = `You are Flowa, a smart financial AI assistant. Analyze this transaction and give honest feedback (1 sentence max):
    - Amount: ₦${amount.toLocaleString()}
    - Category: ${category}
    - Description: ${description}
    
    If the amount seems excessive for the category, express concern and suggest budgeting. If reasonable, be encouraging. Be honest and helpful. Keep it under 15 words.`

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return text || getMockReaction(category, amount)
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return getMockReaction(category, amount)
  }
}

function getMockReaction(category: string, amount: number): string {
  const reactions: Record<string, string[]> = {
    food: [
      "Delicious choice! ₦100 added to your savings pot.",
      "Enjoying a meal? Keep tracking those transactions!",
      "Good taste! Your savings are growing.",
    ],
    entertainment: [
      "Quality entertainment! ₦450 towards your goals.",
      "Treating yourself wisely - savings adjusted!",
      "Entertainment awaits, and so do your savings!",
    ],
    shopping: [
      "Great purchase! ₦1,560 in savings power.",
      "Smart shopping leads to smart savings.",
      "Every purchase brings you closer to your goals!",
    ],
    bills: [
      "Bills paid, savings tracked. ₦250 secured.",
      "Responsible handling of expenses!",
      "Bills under control, future secured!",
    ],
    transport: [
      "On the move! ₦80 saved on this trip.",
      "Getting places efficiently - savings tracking!",
      "Every journey brings you closer to your goals.",
    ],
    other: [
      "Transaction logged! ₦100 for your future.",
      "Tracking every step of your journey!",
      "Small steps, big savings impact!",
    ],
  }

  const categoryReactions = reactions[category] || reactions.other
  return categoryReactions[Math.floor(Math.random() * categoryReactions.length)]
}
