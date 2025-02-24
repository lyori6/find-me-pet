"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import LocationStep from "./location-step"

interface QuestionnaireProps {
  onSubmit: (formData: any) => void
}

const steps = [
  {
    type: "location",
  },
  {
    question: "What brings you here today?",
    options: [
      { icon: "🐾", text: "Ready to adopt", value: "adopt" },
      { icon: "🔍", text: "Just exploring", value: "explore" },
      { icon: "🎯", text: "Looking for specific pet", value: "specific" },
    ],
  },
  {
    question: "Tell us about your experience with animals",
    type: "text",
    placeholder:
      "Do you have any animals right now? Did you have any animals in the past? Tell us in a few sentences...",
  },
  {
    question: "What's your living space like?",
    options: [
      { icon: "🏡", text: "House with yard", value: "house_yard" },
      { icon: "🏠", text: "House without yard", value: "house_no_yard" },
      { icon: "🏢", text: "Apartment/Condo", value: "apartment" },
    ],
  },
  {
    question: "Any additional information you'd like to share?",
    type: "text",
    placeholder: "Tell us anything else that might help us find your perfect match...",
    optional: true,
  },
]

export default function Questionnaire({ onSubmit }: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentStep]: value })
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  const handleLocationSubmit = (zipCode: string) => {
    setAnswers({ ...answers, zipCode })
    setCurrentStep(currentStep + 1)
  }

  const currentQuestion = steps[currentStep]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-screen"
          >
            <div className="loading-animation" />
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                )}
                <div className="text-lg font-semibold text-gray-700">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
              <div className="flex justify-between mb-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-full ${
                      index <= currentStep ? "bg-primary" : "bg-gray-200"
                    } ${index === 0 ? "rounded-l-full" : ""} ${index === steps.length - 1 ? "rounded-r-full" : ""}`}
                  />
                ))}
              </div>
            </div>
            {currentStep === 0 ? (
              <LocationStep onSubmit={handleLocationSubmit} />
            ) : currentQuestion.type === "text" ? (
              <div className="max-w-xl mx-auto">
                <Textarea
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentStep] || ""}
                  onChange={(e) => setAnswers({ ...answers, [currentStep]: e.target.value })}
                  className="min-h-[120px] text-base leading-relaxed p-4"
                />
                <div className="mt-4 flex justify-end items-center gap-4">
                  {currentQuestion.optional && (
                    <button onClick={() => handleAnswer("")} className="skip-button">
                      Skip
                    </button>
                  )}
                  <Button
                    onClick={() => handleAnswer(answers[currentStep] || "")}
                    className="bg-primary text-white px-8 py-2"
                  >
                    {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="option-button"
                    aria-label={option.text}
                  >
                    <span className="text-4xl">{option.icon}</span>
                    <span className="text-lg font-medium text-center">{option.text}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

