"use client"

import Link from "next/link"
import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { toast } from "sonner"
import { ArrowLeft, Plus, X, Copy, Check } from "lucide-react"

export default function SplitPage() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [participants, setParticipants] = useState<Array<{ name: string; contact: string }>>([{ name: "", contact: "" }])
  const [loading, setLoading] = useState(false)
  const [shareLink, setShareLink] = useState("")
  const [copied, setCopied] = useState(false)

  const validParticipants = participants.filter(p => p.name)
  const totalPeople = validParticipants.length > 0 ? validParticipants.length + 1 : 1
  const splitAmount = amount ? Math.round(Number.parseInt(amount) / totalPeople) : 0

  const addParticipant = () => {
    setParticipants([...participants, { name: "", contact: "" }])
  }

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const updateParticipant = (index: number, field: "name" | "contact", value: string) => {
    const updated = [...participants]
    updated[index][field] = value
    setParticipants(updated)
  }

  const createSplitBill = async () => {
    if (!amount || !description) {
      toast.error("Enter amount and description")
      return
    }

    const validParticipants = participants.filter(p => p.name)
    if (validParticipants.length === 0) {
      toast.error("Add at least one person")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/split-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: Number.parseInt(amount),
          description,
          participants: validParticipants.map(p => ({ ...p, amount: splitAmount }))
        })
      })

      const data = await response.json()
      if (data.success) {
        setShareLink(data.shareLink)
        toast.success("Split bill created!")
      } else {
        toast.error(data.error || "Failed to create")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 flex items-center gap-3">
        <Link href="/">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold">Split Bill</h1>
      </div>

      {shareLink ? (
        <div className="px-4 py-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-bold text-lg mb-2">Bill Created!</h3>
            <p className="text-sm text-gray-600 mb-4">Share this link with {totalPeople - 1} {totalPeople === 2 ? "person" : "people"}</p>
            <div className="bg-white rounded-xl p-3 flex items-center gap-2">
              <input value={shareLink} readOnly className="flex-1 text-sm text-gray-600 outline-none" />
              <button onClick={copyLink} className="bg-purple-600 text-white p-2 rounded-lg">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4">
            <h4 className="font-semibold mb-3">Split Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold">₦{Number.parseInt(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Each Person Pays</span>
                <span className="font-bold text-purple-600">₦{splitAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total People</span>
                <span className="font-bold">{totalPeople}</span>
              </div>
            </div>
          </div>
          <button onClick={() => { setShareLink(""); setAmount(""); setDescription(""); setParticipants([{ name: "", contact: "" }]) }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold">
            Create Another Split
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 space-y-4">
          <div className="gradient-primary rounded-2xl p-6 text-white text-center">
            <p className="text-white/80 text-sm mb-2">Total Amount</p>
            <h2 className="text-4xl font-bold mb-4">₦{amount || "0"}</h2>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-sm text-white/80">Each pays</p>
              <p className="text-2xl font-bold">₦{splitAmount.toLocaleString()}</p>
              <p className="text-xs text-white/60 mt-1">{totalPeople} {totalPeople === 1 ? "person" : "people"} total</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-sm font-semibold mb-2 block">Total Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className="w-full border rounded-xl p-3 text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Dinner at restaurant" className="w-full border rounded-xl p-3" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Add People</h3>
              <button onClick={addParticipant} className="text-purple-600 flex items-center gap-1 text-sm font-semibold">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={p.name} onChange={(e) => updateParticipant(i, "name", e.target.value)} placeholder="Name" className="flex-1 border rounded-lg p-2 text-sm" />
                  <input type="text" value={p.contact} onChange={(e) => updateParticipant(i, "contact", e.target.value)} placeholder="Phone/Email" className="flex-1 border rounded-lg p-2 text-sm" />
                  {participants.length > 1 && (
                    <button onClick={() => removeParticipant(i)} className="text-red-500 p-2">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={createSplitBill} disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50">
            {loading ? "Creating..." : "Create Split Bill"}
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
