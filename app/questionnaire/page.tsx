"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { saveZipCode, validateZipCode } from '@/app/utils/storage'
import { cn } from "@/lib/utils"
import QuestionnaireSteps from '@/app/components/QuestionnaireSteps'

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    lifestyle: '',
    homeType: '',
    experience: '',
    activity: '',
    petTypes: [] as string[],
    zipCode: ''
  })
  
  const totalSteps = 6 // Updated to include pet types step
  
  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleNext = () => {
    setCurrentStep(prev => prev + 1)
  }
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }
  
  const handleSubmit = () => {
    // Save data to localStorage
    localStorage.setItem('petMatchPreferences', JSON.stringify(formData))
    
    // Save zip code using our utility
    if (formData.zipCode && validateZipCode(formData.zipCode)) {
      saveZipCode(formData.zipCode)
    }
    
    // Set flag to indicate we're coming from the questionnaire flow
    sessionStorage.setItem("comingFromQuestionnaire", "true")
    
    // Handle pet types
    const petTypesParam = formData.petTypes.length === 3 ? 'any' : formData.petTypes.join(',')
    
    // Navigate to results
    router.push(`/results?zipCode=${encodeURIComponent(formData.zipCode)}&petTypes=${encodeURIComponent(petTypesParam)}`)
  }
  
  return (
    <div className="min-h-screen py-12">
      {/* Progress bar */}
      <div className="max-w-md mx-auto mb-8 px-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground text-center">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4">
        <QuestionnaireSteps
          currentStep={currentStep}
          formData={formData}
          updateFormData={updateFormData}
          onNextStep={handleNext}
        />
        
        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between max-w-md mx-auto">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-8"
            >
              Back
            </Button>
          )}
          
          {currentStep === totalSteps - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!validateZipCode(formData.zipCode)}
              variant="none"
              className={cn(
                "px-8 ml-auto transition-all duration-200",
                validateZipCode(formData.zipCode)
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl hover:opacity-90"
                  : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed text-white/70"
              )}
            >
              Find Pets
            </Button>
          ) : currentStep !== 4 && (
            <Button
              onClick={handleNext}
              className="px-8 ml-auto"
              disabled={
                (currentStep === 0 && !formData.lifestyle) ||
                (currentStep === 1 && !formData.homeType) ||
                (currentStep === 2 && !formData.experience) ||
                (currentStep === 3 && !formData.activity) ||
                (currentStep === 4 && formData.petTypes.length === 0)
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
