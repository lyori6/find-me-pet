"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { saveZipCode, validateZipCode } from '@/app/utils/storage'
import QuestionnaireSteps from '@/app/components/QuestionnaireSteps'

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    lifestyle: '',
    homeType: '',
    experience: '',
    activity: '',
    zipCode: ''
  })
  
  const updateFormData = (field: string, value: string) => {
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
    
    // Navigate to results
    router.push(`/results?zipCode=${encodeURIComponent(formData.zipCode)}`)
  }
  
  return (
    <div className="min-h-screen py-12">
      {/* Progress bar */}
      <div className="container max-w-md mx-auto mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
            style={{ width: `${(currentStep + 1) * 20}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-muted-foreground text-right">
          Step {currentStep + 1} of 5
        </div>
      </div>
      
      <div className="container max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <QuestionnaireSteps 
                currentStep={currentStep}
                formData={formData}
                updateFormData={updateFormData}
                onNextStep={handleNext}
              />
              
              <div className="flex justify-between mt-8">
                {currentStep > 0 ? (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                ) : (
                  <div></div> // Empty div for spacing
                )}
                
                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 0 && !formData.lifestyle) ||
                      (currentStep === 1 && !formData.homeType) ||
                      (currentStep === 2 && !formData.experience) ||
                      (currentStep === 3 && !formData.activity)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.zipCode || !validateZipCode(formData.zipCode)}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Find Pets
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

