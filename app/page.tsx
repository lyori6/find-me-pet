"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import QuickSearchButton from '@/components/ui/quick-search-button'
import RotatingHero from '@/app/components/RotatingHero'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Rotating Hero Section - Full screen, outside container */}
      <RotatingHero />
    </main>
  )
}
