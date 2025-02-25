"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

interface LocationStepProps {
  onSubmit: (zipCode: string) => void
}

export default function LocationStep({ onSubmit }: LocationStepProps) {
  const [zipCode, setZipCode] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateZipCode(zipCode)) {
      onSubmit(zipCode)
    } else {
      setError("Please enter a valid 5-digit US zip code.")
    }
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5)
    setZipCode(value)
    if (error && validateZipCode(value)) {
      setError("")
    }
  }

  const validateZipCode = (zip: string) => {
    return /^\d{5}$/.test(zip)
  }

  const handleGeolocation = async () => {
    setIsLocating(true)
    setError("")

    try {
      console.log("Starting location detection...")
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!("geolocation" in navigator)) {
          reject(new Error("Geolocation is not supported"))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const { latitude, longitude } = position.coords
      console.log("Got coordinates:", { latitude, longitude })

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
        {
          headers: {
            "Accept": "application/json",
            "User-Agent": "FindMePet/1.0"
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Location API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Location API response:", data)

      const postalCode = data.address?.postcode
      console.log("Found postal code:", postalCode)

      if (!postalCode) {
        throw new Error("No postal code found")
      }

      const cleanPostalCode = postalCode.replace(/\D/g, "").slice(0, 5)
      console.log("Cleaned postal code:", cleanPostalCode)

      if (!validateZipCode(cleanPostalCode)) {
        throw new Error(`Invalid postal code format: ${cleanPostalCode}`)
      }

      setZipCode(cleanPostalCode)
    } catch (err) {
      console.error("Location error:", err)
      setError(
        err instanceof GeolocationPositionError && err.code === 1
          ? "Please enable location access in your browser settings"
          : "Could not detect your location. Please enter your zip code manually."
      )
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter your zip code"
            value={zipCode}
            onChange={handleZipCodeChange}
            maxLength={5}
            className="w-full"
            disabled={isLocating}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={!validateZipCode(zipCode) || isLocating}
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGeolocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                <span>Detecting location...</span>
              </div>
            ) : (
              "Use my location"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
