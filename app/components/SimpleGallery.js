'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SimpleGallery({ 
  photos = [], 
  petName = 'Pet',
  className = '',
  onImageClick = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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
      style={{ aspectRatio: '4/3' }}
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
          onClick={() => onImageClick && onImageClick(currentIndex)}
          style={{ cursor: onImageClick ? 'pointer' : 'default' }}
        />
      </div>
      
      {photos.length > 1 && (
        <>
          {/* Large navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 text-black shadow-lg z-10 hover:bg-white transition-all"
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 text-black shadow-lg z-10 hover:bg-white transition-all"
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </button>
          
          {/* Image counter - positioned at bottom right with semi-transparent background */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium z-10">
            <span aria-label="Image counter">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// Lightbox component
export function SimpleLightbox({ 
  isOpen,
  onClose,
  photos = [],
  petName = 'Pet',
  startIndex = 0
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Reset index when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  if (!isOpen) return null;

  // Handle navigation
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent clicks on the content from closing
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Fixed aspect ratio container for the image */}
          <div className="relative" style={{ aspectRatio: '16/9' }}>
            <Image
              src={photoUrl}
              alt={`Photo of ${petName}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            
            {/* Navigation buttons - larger size */}
            {photos.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-4 text-black shadow-lg hover:bg-white transition-all"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-4 text-black shadow-lg hover:bg-white transition-all"
                  aria-label="Next photo"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            
            {/* Image counter - positioned at bottom right with semi-transparent background */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium z-10">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
          
          {/* Close button - high contrast and larger */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black text-white rounded-full p-3 shadow-lg z-10 hover:bg-black/80 transition-all"
            aria-label="Close gallery"
          >
            <X size={28} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
