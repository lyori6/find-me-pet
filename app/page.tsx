"use client"

import Link from "next/link"
import ImageCarousel from "@/components/image-carousel"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const images = [
  "/placeholder.svg?height=600&width=1200",
  "/placeholder.svg?height=600&width=1200",
  "/placeholder.svg?height=600&width=1200",
]

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 to-blue-50 opacity-40" />

      {/* Content */}
      <div className="relative">
        <section className="h-screen relative overflow-hidden">
          <ImageCarousel images={images} />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Find your perfect pet companion
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tell us about your lifestyle, we'll help you discover your ideal match
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <Link href="/questionnaire">
                <Button
                  size="lg"
                  className="text-xl px-8 py-6 bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:scale-105 active:scale-98 transition-transform duration-200"
                >
                  Start Your Journey
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Finding a forever friend is a meaningful journey. Let's take it one step at a time.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}

