"use client"

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Sparkles } from "lucide-react"

interface MatchStat {
  label: string
  value: number
}

interface Recommendation {
  petName: string
  matchReason: string
  stats: MatchStat[]
}

interface AiRecommendationProps {
  selectedTypes: string[]
  zipCode: string
  filteredAnimals: any[]
  onRetry?: () => void
}

export default function AiRecommendation({ 
  selectedTypes, 
  zipCode, 
  filteredAnimals,
  onRetry 
}: AiRecommendationProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load any cached recommendation from localStorage
  useEffect(() => {
    const cachedRecommendation = localStorage.getItem("aiRecommendation")
    if (cachedRecommendation) {
      try {
        setRecommendation(JSON.parse(cachedRecommendation))
      } catch (e) {
        console.error("Error parsing cached recommendation:", e)
        localStorage.removeItem("aiRecommendation")
      }
    } else {
      // Only fetch if we have animals and no cached recommendation
      if (filteredAnimals.length > 0) {
        fetchRecommendation()
      }
    }
  }, [])

  // Clear recommendation when critical inputs change
  useEffect(() => {
    localStorage.removeItem("aiRecommendation")
    setRecommendation(null)
    // Don't automatically fetch on change to avoid multiple requests
  }, [selectedTypes, zipCode])

  const fetchRecommendation = async () => {
    if (!filteredAnimals || filteredAnimals.length === 0) {
      setError("No pets available to generate recommendations from.")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/getAiRecommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTypes,
          zipCode,
          filteredAnimals
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get AI recommendation")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setRecommendation(data.recommendation)
      // Cache the recommendation in localStorage
      localStorage.setItem("aiRecommendation", JSON.stringify(data.recommendation))
    } catch (err: any) {
      setError(err.message || "Something went wrong with the AI recommendation")
      console.error("AI recommendation error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    }
    fetchRecommendation()
  }

  // If there are no animals, don't show anything
  if (filteredAnimals.length === 0) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">AI Pet Match</h2>
          </div>
          {recommendation && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRetry}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-red-500 mb-3">{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Try Again
              </Button>
            </motion.div>
          )}

          {recommendation && !loading && !error && (
            <motion.div
              key="recommendation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-muted-foreground text-lg mb-6">
                Based on your preferences, we think <span className="font-semibold text-primary">{recommendation.petName}</span>{" "}
                could be a great match! {recommendation.matchReason}
              </p>

              <div className="grid grid-cols-3 gap-4">
                {recommendation.stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <Badge variant="secondary" className="mb-2 text-lg px-4 py-1">
                      {stat.value}%
                    </Badge>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
