"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getZipCode } from "@/app/utils/storage";
import GradientText from "./GradientText";

// Add a style tag for the custom glow effect
const glowStyles = `
  .glow-effect {
    position: relative;
  }
  
  .glow-effect::before {
    content: "";
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    background: linear-gradient(135deg, #ef4444, #14b8a6);
    border-radius: 16px;
    z-index: -1;
    filter: blur(10px);
    opacity: 0.15;
  }

  .rotating-pet-name {
    font-weight: 600;
    background: linear-gradient(to right, #ff1a1a, #00ffee);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.5px;
    text-shadow: none;
    line-height: 0.9;
  }

  @media (max-width: 768px) {
    .rotating-pet-name {
      font-size: 6em;
    }
  }

  @media (min-width: 769px) {
    .rotating-pet-name {
      font-size: 8em;
    }
  }
`;

/**
 * RotatingHero Component
 * 
 * A premium hero section with rotating pet names and background images
 * Enhanced with beautiful styling, gradients, and animations
 * Optimized for proper image sizing across all screen widths
 */
export default function RotatingHero() {
  // Pet data with both names and image paths - using standard Next.js public paths
  const pets = [
    { name: "Shasta", imagePath: "/1_shatsa.jpeg" },
    { name: "Greta", imagePath: "/2_greta.jpeg" },
    { name: "Maria", imagePath: "/3_maria.jpeg" },
    { name: "Simu", imagePath: "/4_simu.jpeg" },
    { name: "Sardine", imagePath: "/5_sardine.jpeg" },
    { name: "Bao", imagePath: "/6_bao.jpeg" },
    { name: "Oreo", imagePath: "/7_oreo.jpeg" },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Fallback image path
  const fallbackImage = "/placeholder-pet.jpg";
  
  // Set up the interval for rotating pets
  useEffect(() => {
    // First transition happens faster (1 second)
    const firstTransitionTimer = setTimeout(() => {
      setIsReady(false); // Reset ready state before changing index
      setCurrentIndex((prevIndex) => (prevIndex + 1) % pets.length);
      setImagesLoaded(false); // Reset image loaded state for the new image
    }, 1000);
    
    // Regular interval for subsequent transitions (4 seconds)
    const timer = setInterval(() => {
      setIsReady(false); // Reset ready state before changing index
      setCurrentIndex((prevIndex) => (prevIndex + 1) % pets.length);
      setImagesLoaded(false); // Reset image loaded state for the new image
    }, 4000);
    
    return () => {
      clearTimeout(firstTransitionTimer);
      clearInterval(timer);
    };
  }, [pets.length]);
  
  // Current image to show - use fallback if primary image fails
  const currentImage = useFallback 
    ? fallbackImage 
    : pets[currentIndex].imagePath;
  
  // Convert pet name to title case for display
  const displayName = pets[currentIndex].name.charAt(0).toUpperCase() + pets[currentIndex].name.slice(1);

  // Effect to set ready state after image is loaded
  useEffect(() => {
    if (imagesLoaded || useFallback) {
      // Minimal delay to ensure image is visible before showing the name
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50); 
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded, useFallback]);
  
  return (
    <>
      {/* Inject the custom styles */}
      <style jsx>{glowStyles}</style>
      
      <div className="w-full bg-background flex justify-center py-0 relative overflow-hidden">
        {/* Custom background glow effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-100 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[50rem] h-[50rem] rounded-full bg-primary/100 blur-[70px]"></div>
          <div className="absolute top-40 -right-32 w-[50rem] h-[50rem] rounded-full bg-secondary/90 blur-[80px]"></div>
          <div className="absolute bottom-20 left-1/3 w-[40rem] h-[40rem] rounded-full bg-primary/80 blur-[75px]"></div>
        </div>
        
        {/* This wrapper ensures the content won't exceed max-width on large screens */}
        <div className="w-full max-w-4xl px-4 md:px-6 lg:px-8 flex flex-col items-center relative z-10">
          {/* Hero Text above image with enhanced styling */}
          <div className="text-center mb-6 md:mb-8 pt-2">
            <h1 className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 mb-3">
              <span className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-slate-800 mb-1 md:mb-0">
                Meet
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={pets[currentIndex].name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 10 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0 }} 
                  className="font-semibold rotating-pet-name"
                >
                  {displayName}
                </motion.span>
              </AnimatePresence>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-slate-700 max-w-lg mx-auto mt-4 font-normal">
              Your new best friend is waiting for you
            </p>
          </div>
          
          {/* Image container with glow effect */}
          <div className="w-full max-w-[650px] mb-8 md:mb-10 flex justify-center relative px-4 md:px-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full z-10 glow-effect"
                style={{ maxWidth: "min(100%, 650px)" }}
              >
                <div 
                  className="relative overflow-hidden w-full z-10 rounded-2xl"
                  style={{ paddingBottom: "66.67%" }}
                >
                  <Image
                    src={currentImage}
                    alt={`Meet ${displayName}`}
                    width={650}
                    height={433}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 650px"
                    className="absolute top-0 left-0 w-full h-full object-cover object-center rounded-2xl"
                    priority={true}
                    onLoad={() => {
                      console.log(`Image loaded: ${currentImage}`);
                      setImagesLoaded(true);
                      setUseFallback(false);
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image for ${displayName}, using fallback`, e);
                      setUseFallback(true);
                    }}
                  />
                  
                  {/* Gradient overlay for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50 pointer-events-none rounded-2xl" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* CTA Buttons - Below the image with enhanced styling and spacing */}
          <div className="w-full mt-2 md:mt-4 pb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              <Link href="/questionnaire" className="w-full sm:w-auto">
                <Button 
                  className="w-full h-14 text-base md:text-lg font-bold px-8 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  Find Perfect Pet
                </Button>
              </Link>
              
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <Button 
                  variant="outline"
                  className="w-full h-14 text-base md:text-lg font-medium px-8 border-2 border-slate-300 text-slate-700 rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                  onClick={() => {
                    const zipCode = getZipCode();
                    if (zipCode) {
                      window.location.href = `/alt-results?zipCode=${encodeURIComponent(zipCode)}`;
                    } else {
                      window.location.href = "/search";
                    }
                  }}
                >
                  <Search className="w-5 h-5" /> Quick Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
