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
    <main>
      {/* Rotating Hero Section - Full screen, outside container */}
      <RotatingHero />
      
      {/* Spacer div to push footer down */}
      <div className="h-84 md:h-[28rem] lg:h-[35rem]"></div>
    </main>
  )
}
