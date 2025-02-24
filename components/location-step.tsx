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

  const handleGeolocation = () => {
    setIsLocating(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use a reverse geocoding service here
          setZipCode("12345")
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error.message)
          alert("Unable to retrieve your location. Please enter your zip code manually.")
          setIsLocating(false)
        },
      )
    } else {
      alert("Geolocation is not supported by your browser. Please enter your zip code manually.")
      setIsLocating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Where are you located?</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter your US zip code"
            value={zipCode}
            onChange={handleZipCodeChange}
            className="w-full"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-between items-center">
          <Button type="button" onClick={handleGeolocation} variant="outline" disabled={isLocating} className="w-1/2">
            {isLocating ? "Locating..." : "Locate Me"}
          </Button>
          <Button type="submit" className="w-1/2 ml-4" disabled={!validateZipCode(zipCode)}>
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

