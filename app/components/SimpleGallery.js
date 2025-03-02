'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SimpleGallery({ 
  photos = [], 
  petName = 'Pet',
  className = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If no photos, return nothing
  if (!photos || photos.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      nextSlide();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      prevSlide();
    }
  };

  const currentPhoto = photos[currentIndex];
  const photoUrl = currentPhoto?.full || currentPhoto?.large || currentPhoto?.medium || currentPhoto?.small;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ 
        aspectRatio: isMobile ? '1/1' : '4/3',
        maxWidth: isMobile ? '100%' : '85%',
        margin: isMobile ? '0' : '0 auto'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main image container with fixed aspect ratio */}
      <div className="w-full h-full relative">
        <Image
          src={photoUrl}
          alt={`Photo of ${petName}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
          className="object-cover"
          priority={true}
        />
      </div>
      
      {/* Image counter - only show when there are multiple photos */}
      {photos.length > 1 && (
        <div
          className="absolute bottom-4 right-4 bg-primary text-white px-3 py-1.5 rounded-md text-sm font-bold z-30 shadow-lg"
        >
          {currentIndex + 1} / {photos.length}
        </div>
      )}
      
      {/* Dot indicators - always show when there are multiple photos */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-30">
          {photos.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary border-2 border-white' 
                  : 'bg-white hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {photos.length > 1 && (
        <>
          {/* Navigation buttons with 50% opacity background */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm rounded-full p-3 text-black shadow-lg z-10 hover:bg-white/80 transition-all"
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm rounded-full p-3 text-black shadow-lg z-10 hover:bg-white/80 transition-all"
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
    </div>
  );
}
