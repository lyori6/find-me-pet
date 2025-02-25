"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { validateZipCode } from '@/app/utils/storage'
import LoadingSpinner from './LoadingSpinner'

interface QuestionnaireStepsProps {
  currentStep: number
  formData: {
    lifestyle: string
    homeType: string
    experience: string
    activity: string
    zipCode: string
  }
  updateFormData: (field: string, value: string) => void
  onNextStep: () => void
}

export default function QuestionnaireSteps({ 
  currentStep, 
  formData, 
  updateFormData,
  onNextStep
}: QuestionnaireStepsProps) {
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  
  const OptionButton = ({ value, label, field }: { value: string, label: string, field: string }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        updateFormData(field, value)
        // Auto-advance to next step after selection (except for the last step)
        if (currentStep < 4) {
          setTimeout(() => {
            onNextStep()
          }, 300)
        }
      }}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        formData[field as keyof typeof formData] === value 
          ? 'border-primary bg-primary/5 font-medium' 
          : 'border-muted hover:border-primary/30'
      }`}
    >
      {label}
    </motion.button>
  )
  
  const detectLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser')
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      
      // Use OpenStreetMap's Nominatim API to get zip code from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      )
      
      if (!response.ok) {
        throw new Error('Failed to get location information')
      }
      
      const data = await response.json()
      const detectedZipCode = data.address.postcode
      
      if (detectedZipCode && validateZipCode(detectedZipCode)) {
        updateFormData('zipCode', detectedZipCode)
      } else {
        throw new Error('Could not determine a valid zip code from your location')
      }
    } catch (err: any) {
      setLocationError(err.message || 'Failed to detect your location')
    } finally {
      setLocationLoading(false)
    }
  }
  
  switch (currentStep) {
    case 0:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">What's your lifestyle like?</h2>
          <div className="space-y-3">
            <OptionButton field="lifestyle" value="busy" label="Busy - I'm often out of the house" />
            <OptionButton field="lifestyle" value="balanced" label="Balanced - Mix of home and away time" />
            <OptionButton field="lifestyle" value="homebody" label="Homebody - I'm usually at home" />
            <OptionButton field="lifestyle" value="wfh" label="Work from home - Home most weekdays" />
          </div>
        </div>
      )
      
    case 1:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">What type of home do you have?</h2>
          <div className="space-y-3">
            <OptionButton field="homeType" value="apartment" label="Apartment/Condo - No yard" />
            <OptionButton field="homeType" value="small-yard" label="House with small yard" />
            <OptionButton field="homeType" value="large-yard" label="House with large yard" />
            <OptionButton field="homeType" value="rural" label="Rural property with lots of space" />
          </div>
        </div>
      )
      
    case 2:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">What's your pet experience level?</h2>
          <div className="space-y-3">
            <OptionButton field="experience" value="first-time" label="First-time pet owner" />
            <OptionButton field="experience" value="some" label="Some experience with pets" />
            <OptionButton field="experience" value="experienced" label="Experienced pet owner" />
            <OptionButton field="experience" value="professional" label="Professional experience (vet, trainer, etc.)" />
          </div>
        </div>
      )
      
    case 3:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">How active is your lifestyle?</h2>
          <div className="space-y-3">
            <OptionButton field="activity" value="sedentary" label="Sedentary - Minimal exercise" />
            <OptionButton field="activity" value="moderate" label="Moderate - Short walks, some play time" />
            <OptionButton field="activity" value="active" label="Active - Regular exercise, outdoor activities" />
            <OptionButton field="activity" value="very-active" label="Very active - Running, hiking, adventures" />
          </div>
        </div>
      )
      
    case 4:
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">Where are you located?</h2>
          <p className="text-muted-foreground mb-4">
            We'll use this to find adoptable pets near you.
          </p>
          
          <div className="mb-6">
            <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => updateFormData('zipCode', e.target.value)}
              placeholder="Enter your 5-digit zip code"
              className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                formData.zipCode && !validateZipCode(formData.zipCode)
                  ? 'border-destructive'
                  : 'border-input'
              }`}
              maxLength={5}
            />
            {formData.zipCode && !validateZipCode(formData.zipCode) && (
              <p className="mt-1 text-sm text-destructive">
                Please enter a valid 5-digit zip code
              </p>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={detectLocation}
              disabled={locationLoading}
              className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80"
            >
              {locationLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Detecting location...</span>
                </>
              ) : (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="1"/>
                    <line x1="12" y1="2" x2="12" y2="4"/>
                    <line x1="12" y1="20" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="4" y2="12"/>
                    <line x1="20" y1="12" x2="22" y2="12"/>
                  </svg>
                  <span>Use my current location</span>
                </>
              )}
            </button>
          </div>
          
          {locationError && (
            <p className="mt-2 text-sm text-destructive text-center">
              {locationError}
            </p>
          )}
        </div>
      )
      
    default:
      return null
  }
} 