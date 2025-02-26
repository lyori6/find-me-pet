'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

export default function IOSGallery({ 
  photos = [], 
  petName = 'Pet',
  onClose = null,
  startIndex = 0,
  className = '',
  isLightbox = false,
  onImageClick = null,
}) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [isMobile, setIsMobile] = useState(false);
  const slideRef = useRef(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    if (photos.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevSlide = useCallback(() => {
    if (photos.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Escape' && isLightbox && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide, isLightbox, onClose]);

  // Config for react-swipeable
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    delta: 10,
    swipeDuration: 500,
  });

  // iOS-inspired spring physics for the gallery
  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
  };

  // If no photos, return nothing
  if (!photos || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[activeIndex];
  const photoUrl = currentPhoto?.full || currentPhoto?.large || currentPhoto?.medium || currentPhoto?.small;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden w-full ${isLightbox ? 'h-full' : 'aspect-[4/3]'} ${className}`}
      {...swipeHandlers}
    >
      {/* Main Image Container with iOS-like animations */}
      <motion.div
        ref={slideRef}
        className="w-full h-full relative"
        initial={false}
        animate={{ 
          x: 0,
          scale: isDragging.current ? 0.95 : 1
        }}
        transition={springTransition}
        onClick={() => onImageClick && onImageClick(activeIndex)}
        style={{ cursor: onImageClick ? 'pointer' : 'default' }}
      >
        <Image
          src={photoUrl}
          alt={`Photo of ${petName}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
          className="object-cover rounded-2xl"
          priority
        />

        {/* Image counter pill - styled like iOS */}
        {photos.length > 1 && (
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeIndex + 1} / {photos.length}
          </motion.div>
        )}
      </motion.div>

      {/* iOS-like dots pagination for mobile */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5">
          {photos.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows - iOS inspired minimal styling */}
      {photos.length > 1 && (
        <>
          <motion.button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2.5 text-black shadow-lg border border-white/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            aria-label="Previous photo"
          >
            <ChevronLeft size={isMobile ? 18 : 22} />
          </motion.button>
          <motion.button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md rounded-full p-2.5 text-black shadow-lg border border-white/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            aria-label="Next photo"
          >
            <ChevronRight size={isMobile ? 18 : 22} />
          </motion.button>
        </>
      )}

      {/* Close button for lightbox mode - high contrast as requested */}
      {isLightbox && onClose && (
        <motion.button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black text-white rounded-full p-2.5 shadow-lg z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={springTransition}
          aria-label="Close gallery"
        >
          <X size={24} />
        </motion.button>
      )}
    </div>
  );
}

// Lightbox version of the gallery
export function IOSLightbox({ 
  isOpen,
  onClose,
  photos = [],
  petName = 'Pet',
  startIndex = 0
}) {
  if (!isOpen) return null;

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
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent clicks on the content from closing
        >
          <IOSGallery
            photos={photos}
            petName={petName}
            startIndex={startIndex}
            onClose={onClose}
            isLightbox={true}
            className="h-full max-h-[85vh]"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
