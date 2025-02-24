"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import PetCard from "@/components/pet-card"
import RecommendationSection from "@/components/recommendation-section"
import { motion } from "framer-motion"

// Mock data for pet results
const mockPets = [
  { id: 1, name: "Buddy", type: "Dog", breed: "Golden Retriever", image: "/placeholder.svg?height=200&width=200" },
  { id: 2, name: "Whiskers", type: "Cat", breed: "Siamese", image: "/placeholder.svg?height=200&width=200" },
  { id: 3, name: "Hoppy", type: "Rabbit", breed: "Dutch", image: "/placeholder.svg?height=200&width=200" },
  { id: 4, name: "Rex", type: "Dog", breed: "German Shepherd", image: "/placeholder.svg?height=200&width=200" },
  { id: 5, name: "Mittens", type: "Cat", breed: "Maine Coon", image: "/placeholder.svg?height=200&width=200" },
  { id: 6, name: "Thumper", type: "Rabbit", breed: "Lionhead", image: "/placeholder.svg?height=200&width=200" },
]

// Mock recommendation data
const mockRecommendation = {
  petName: "Buddy",
  matchReason:
    "Their friendly and energetic personality aligns perfectly with your active lifestyle and spacious home environment.",
  stats: [
    { label: "Lifestyle Match", value: 95 },
    { label: "Energy Level", value: 90 },
    { label: "Space Match", value: 85 },
  ],
}

const getRecommendationTemplate = (preferences: any) => {
  // This will be replaced with actual logic based on user preferences
  return mockRecommendation
}

export default function ResultsPage() {
  const router = useRouter()
  const [pets, setPets] = useState(mockPets)
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState(mockRecommendation)

  useEffect(() => {
    // Simulate API call and process stored preferences
    const timer = setTimeout(() => {
      const preferences = localStorage.getItem("petMatchPreferences")
      if (preferences) {
        const parsedPreferences = JSON.parse(preferences)
        setRecommendation(getRecommendationTemplate(parsedPreferences))
      }
      setPets(mockPets)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Your Perfect Pet Matches</h1>

        <RecommendationSection {...recommendation} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PetCard pet={pet} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Button
            className="bg-primary text-white px-8 py-3 text-lg rounded-full hover:bg-primary-dark transition-colors duration-300"
            onClick={() => router.push("/questionnaire")}
          >
            Start Over
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

