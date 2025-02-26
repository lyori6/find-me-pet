"use client"

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { petsCache } from '@/app/utils/cache';

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

// Helper function to normalize pet types for consistency across components
const normalizeTypes = (types) => {
  if (!types || !Array.isArray(types) || types.length === 0) {
    return ["dog", "cat", "rabbit"]; // Default to all common types
  }
  
  return types.map(type => {
    if (!type) return '';
    type = String(type).toLowerCase().trim();
    // Handle singular/plural forms
    if (type === 'dogs') return 'dog';
    if (type === 'cats') return 'cat';
    if (type === 'rabbits') return 'rabbit';
    return type;
  }).filter(Boolean); // Remove any empty strings
};

// Tooltip descriptions for each stat type
const STAT_DESCRIPTIONS = {
  "Compatibility": "How well this pet's personality and needs may match with your lifestyle based on your search preferences.",
  "Adaptability": "How easily this pet may adjust to new environments, routines, and people based on their temperament and history.",
  "Care Level": "The relative amount of attention, maintenance, and resources this pet may require compared to others of similar type."
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
  const [isMobile, setIsMobile] = useState(false)
  // Reference to track if a request is already in progress to prevent duplicates
  const loadingRef = useRef(false);
  
  const normalizedTypes = normalizeTypes(selectedTypes);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load any cached recommendation from cache using the new utility
  useEffect(() => {
    // Don't proceed if we don't have required data or if a request is already in progress
    if (!zipCode || !filteredAnimals || filteredAnimals.length === 0 || loadingRef.current) {
      return;
    }
    
    // Get user preferences from localStorage
    const petMatchPrefs = localStorage.getItem("petMatchPreferences");
    let userPreferences = null;
    if (petMatchPrefs) {
      try {
        userPreferences = JSON.parse(petMatchPrefs);
        console.log("User preferences from localStorage:", userPreferences);
      } catch (e) {
        console.error("Error parsing pet match preferences:", e);
      }
    }
    
    // If coming from questionnaire flow, clear existing AI match from cache
    const comingFromFlow = sessionStorage.getItem("comingFromQuestionnaire") === "true";
    if (comingFromFlow) {
      console.log("Coming from questionnaire flow, clearing cached recommendation");
      petsCache.clearAiRecommendations();
      sessionStorage.removeItem("comingFromQuestionnaire");
      
      // Fetch a new recommendation if we have animals
      if (filteredAnimals.length > 0 && !loadingRef.current) {
        loadingRef.current = true;
        fetchRecommendation(userPreferences?.petTypes).finally(() => {
          loadingRef.current = false;
        });
      }
      return;
    }
    
    // Try to load recommendation from cache using the new utility
    const cachedRecommendation = petsCache.getAiRecommendation(zipCode, normalizedTypes);
    
    if (cachedRecommendation) {
      console.log("Using cached recommendation from petsCache");
      setRecommendation(cachedRecommendation);
      return;
    }
    
    // If no cached recommendation but we have animals, fetch a new one
    if (filteredAnimals.length > 0 && !loadingRef.current) {
      console.log("No cached recommendation, fetching new one");
      loadingRef.current = true;
      fetchRecommendation(userPreferences?.petTypes).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [zipCode, filteredAnimals]);

  const fetchRecommendation = async (userPetTypes = null) => {
    // Make sure we have valid animals to generate recommendations from
    if (!filteredAnimals || filteredAnimals.length === 0) {
      setError("No pets available to generate recommendations from.");
      return;
    }

    // Always normalize the pet types for consistency
    const typesToUse = normalizeTypes(userPetTypes || selectedTypes);
    
    console.log("Fetching AI recommendation with normalized types:", typesToUse);
    
    // Create a simpler representation of the animals for the API request
    const simplifiedAnimals = filteredAnimals.map(animal => ({
      id: animal.id,
      name: animal.name,
      type: animal.type,
      breeds: {
        primary: animal.breeds?.primary || 'Unknown'
      },
      age: animal.age || 'Unknown',
      size: animal.size || 'Unknown',
      colors: {
        primary: animal.colors?.primary || 'Unknown'
      },
      attributes: {
        spayed_neutered: animal.attributes?.spayed_neutered || false,
        house_trained: animal.attributes?.house_trained || false
      },
      environment: animal.environment || {}
    }));

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/getAiRecommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTypes: typesToUse,
          zipCode,
          filteredAnimals: simplifiedAnimals
        })
      });

      if (!response.ok) {
        throw new Error(`Error getting AI recommendation: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data || !data.recommendation) {
        console.error("Invalid recommendation data:", data);
        throw new Error("Received invalid recommendation data from server");
      }
      
      // Validate that we got a proper recommendation with required fields
      const recommendation = data.recommendation;
      
      // Basic validation to ensure we have the minimal required fields
      if (!recommendation.petName) {
        console.error("Missing pet name in recommendation:", recommendation);
        throw new Error("The AI recommendation is missing a pet name");
      }

      console.log("Recommendation data:", recommendation);

      // Cache the recommendation using the new utility
      petsCache.setAiRecommendation(zipCode, typesToUse, recommendation);

      setRecommendation(recommendation);
    } catch (error) {
      console.error("Error fetching AI recommendation:", error);
      setError(error.message || "Failed to get AI recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    fetchRecommendation();
  }

  // If there are no animals, don't show anything
  if (filteredAnimals.length === 0) {
    return null;
  }

  // Helper function to render stat with tooltip
  const renderStat = (stat: MatchStat, index: number) => {
    const description = STAT_DESCRIPTIONS[stat.label as keyof typeof STAT_DESCRIPTIONS] || 
      `This reflects how well the pet scores in ${stat.label.toLowerCase()}.`;
    
    // For mobile, render without the description text
    if (isMobile) {
      return (
        <div 
          key={index} 
          className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm relative"
          onClick={() => {
            // In the future, this could open a modal with the description
            // For now, we're just removing the description text
          }}
        >
          <Badge variant="secondary" className="mb-2 text-lg px-4 py-1">
            {stat.value}%
          </Badge>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      );
    }
    
    // For desktop, use tooltip
    return (
      <TooltipProvider key={index}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm cursor-help">
              <Badge variant="secondary" className="mb-2 text-lg px-4 py-1">
                {stat.value}%
              </Badge>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px] text-center p-2">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">AI Pet Match</h2>
          </div>
          {/* Refresh button removed as requested */}
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
                {recommendation.stats.map((stat, index) => renderStat(stat, index))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
