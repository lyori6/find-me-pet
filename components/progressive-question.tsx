"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface QuestionOption {
  id: string
  label: string
  icon?: string
}

interface QuestionProps {
  question: string
  type: "multiple-choice" | "free-text"
  options?: QuestionOption[]
  value: string
  onChange: (value: string) => void
  onNext: () => void
  currentStep: number
  totalSteps: number
}

export default function ProgressiveQuestion({
  question,
  type,
  options = [],
  value,
  onChange,
  onNext,
  currentStep,
  totalSteps,
}: QuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </Label>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                  i < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6">{question}</h2>
      </div>

      <div className="space-y-4">
        {type === "multiple-choice" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => (
              <Button
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setTimeout(onNext, 300)
                }}
                className={`h-auto py-6 px-6 flex items-center justify-start text-left transition-all ${
                  value === option.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-accent border-2 border-muted"
                }`}
              >
                {option.icon && <span className="text-2xl mr-4">{option.icon}</span>}
                <span className="text-lg">{option.label}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[150px] text-lg p-4"
            />
            <Button
              onClick={onNext}
              className="w-full py-6 bg-primary text-primary-foreground text-lg"
              disabled={!value.trim()}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

