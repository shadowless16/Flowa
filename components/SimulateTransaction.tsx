"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { showLocalNotification } from "@/lib/push-notifications"

export default function SimulateTransaction() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const simulateTransaction = async (type: "credit" | "debit") => {
    if (!amount) {
      toast.error("Please enter an amount")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/simulate-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || `Simulated ${type}`,
          type
        })
      })

      const data = await response.json()
      
      if (data.success) {
        await showLocalNotification(data.notification.title, data.notification.body)
        toast.success(`Transaction simulated! ${data.notification.body}`)
        setAmount("")
        setDescription("")
        setTimeout(() => window.location.reload(), 1000)
      } else {
        toast.error(data.error || "Simulation failed")
      }
    } catch (error) {
      toast.error("Failed to simulate transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Demo: Simulate Transaction</h3>
      
      <Input
        placeholder="Amount (₦)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <div className="flex gap-2">
        <Button 
          onClick={() => simulateTransaction("credit")}
          disabled={loading}
          variant="default"
        >
          Simulate Credit
        </Button>
        <Button 
          onClick={() => simulateTransaction("debit")}
          disabled={loading}
          variant="outline"
        >
          Simulate Debit
        </Button>
      </div>
    </div>
  )
}