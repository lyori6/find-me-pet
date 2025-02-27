"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import QuickSearchButton from '@/components/ui/quick-search-button'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-rose-50 to-blue-50 opacity-40" />

      {/* Content */}
      <div className="relative">
        <section className="h-screen flex items-center justify-center">
          <div className="container px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Find Your Perfect Pet Companion
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover adoptable pets near you and find your new best friend
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/questionnaire" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full"
                >
                  Start Your Journey
                </Button>
              </Link>
              <QuickSearchButton />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute bottom-10 left-0 right-0 flex justify-center"
            >
              <div className="animate-bounce">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </div>
            </motion.div>
          </div>
        </section>
        
        <section className="py-20 bg-white">
          <div className="container px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-muted rounded-xl p-6 shadow-sm"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-3">Enter Your Location</h3>
                <p className="text-muted-foreground">
                  Provide your zip code or use your current location to find pets near you.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-muted rounded-xl p-6 shadow-sm"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-3">Browse Pets</h3>
                <p className="text-muted-foreground">
                  View profiles of pets available for adoption in your area.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-muted rounded-xl p-6 shadow-sm"
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-3">Connect & Adopt</h3>
                <p className="text-muted-foreground">
                  Contact shelters directly to learn more about your potential new pet.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
