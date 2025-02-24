"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface MatchStat {
  label: string
  value: number
}

interface RecommendationProps {
  petName: string
  matchReason: string
  stats: MatchStat[]
}

export default function RecommendationSection({ petName, matchReason, stats }: RecommendationProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl shadow-sm p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-4">Here's What We Found For You</h2>
      <p className="text-muted-foreground text-lg mb-6">
        Based on your lifestyle and preferences, we think <span className="font-semibold text-primary">{petName}</span>{" "}
        could be a great match! {matchReason}
      </p>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center bg-white rounded-lg p-4 shadow-sm">
            <Badge variant="secondary" className="mb-2 text-lg px-4 py-1">
              {stat.value}%
            </Badge>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

