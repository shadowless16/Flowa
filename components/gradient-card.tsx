import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientCardProps {
  children: ReactNode
  variant?: "primary" | "purple" | "savings"
  className?: string
}

export function GradientCard({ children, variant = "primary", className }: GradientCardProps) {
  const variantClasses = {
    primary: "gradient-primary",
    purple: "gradient-purple",
    savings: "gradient-savings",
  }

  return (
    <div className={cn("rounded-3xl p-6 text-white shadow-lg", variantClasses[variant], className)}>{children}</div>
  )
}
