"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { saveZipCode, validateZipCode } from '@/app/utils/storage'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import NonUSLocationDialog from '@/app/components/NonUSLocationDialog'

export default function SearchPage() {
  const [zipCode, setZipCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showNonUSDialog, setShowNonUSDialog] = useState(false)
  const router = useRouter()
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateZipCode(zipCode)) {
      saveZipCode(zipCode)
      router.push(`/alt-results?zipCode=${encodeURIComponent(zipCode)}`)
    } else {
      setError('Please enter a valid 5-digit zip code')
    }
  }
  
  const detectLocation = async () => {
    setLocationLoading(true)
    setError(null)
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser')
      }

      // Get current position with timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const locationTimeout = setTimeout(() => {
          setLocationLoading(false)
          reject(new Error('Location detection timed out. Please try again or enter your zip code manually'))
        }, 5000) // 5 second timeout
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(locationTimeout)
            resolve(position)
          },
          (error) => {
            clearTimeout(locationTimeout)
            reject(error)
          }
        )
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
      
      // Check if location is in the US
      const country = data.address.country_code
      if (country !== 'us') {
        // Show non-US location dialog
        setError('Unfortunately, we only operate in the United States.')
        handleNonUSLocationDialog()
        return
      }
      
      const detectedZipCode = data.address.postcode
      
      if (detectedZipCode && validateZipCode(detectedZipCode)) {
        setZipCode(detectedZipCode)
        saveZipCode(detectedZipCode)
        router.push(`/alt-results?zipCode=${encodeURIComponent(detectedZipCode)}`)
      } else {
        throw new Error('Could not determine a valid zip code from your location')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to detect your location')
    } finally {
      setLocationLoading(false)
    }
  }
  
  // Function to handle non-US location dialog
  const handleNonUSLocationDialog = () => {
    setShowNonUSDialog(true)
  }
  
  const handleFindShelters = () => {
    window.open('https://www.google.com/search?q=Animal+Shelters+Near+Me', '_blank')
    setShowNonUSDialog(false)
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">Find Pets Near You</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
                Enter your zip code
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value)
                  setError(null)
                }}
                placeholder="Enter 5-digit zip code"
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                maxLength={5}
              />
              {error && (
                <p className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                Search Pets
              </Button>
              
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                className="flex items-center justify-center gap-2 py-2 text-primary hover:text-primary/80"
              >
                {locationLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="default" text="Detecting location..." textPosition="right" />
                  </div>
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
          </form>
        </motion.div>
      </div>
      
      {/* Non-US Location Dialog */}
      <NonUSLocationDialog 
        isOpen={showNonUSDialog} 
        onClose={() => setShowNonUSDialog(false)}
        onFindShelters={handleFindShelters}
      />
    </div>
  )
} 