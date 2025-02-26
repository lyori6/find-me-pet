'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { decode } from 'html-entities';
import { petsCache } from '@/app/utils/cache';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MapPin, 
  Calendar, 
  Check, 
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

export default function PetDetailsClient({ petId }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);

  // Touch handling for image carousel
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check if description needs to be truncated
    if (descriptionRef.current && pet?.description) {
      const content = descriptionRef.current;
      // Set the threshold higher to capture longer descriptions
      const isTruncated = content.scrollHeight > 200;
      setIsDescriptionTruncated(isTruncated);
      
      // If description is not truncated, show full description by default
      if (!isTruncated && !showFullDescription) {
        setShowFullDescription(true);
      }
      
      if (pet?.description) {
        console.log('Description length:', pet.description.length);
        console.log('Description scrollHeight:', content.scrollHeight);
        console.log('Is description truncated:', isTruncated);
      }
    }
  }, [pet, showFullDescription]);

  useEffect(() => {
    async function fetchPetDetails() {
      setLoading(true);
      setError(null);
      
      try {
        // Check cache first using the new utility
        const cachedPet = petsCache.getPetDetails(petId);
        if (cachedPet) {
          setPet(cachedPet);
          setLoading(false);
          return;
        }
        
        // If not in cache, fetch from API
        const response = await fetch(`/api/pet/${petId}`);
        
        // Check for 401 Unauthorized (token issue)
        if (response.status === 401) {
          console.error('Authorization error with pet service');
          setError('Authorization error with pet service. Please try refreshing the page.');
          setLoading(false);
          
          // Wait a few seconds and try again automatically
          setTimeout(() => {
            console.log('Attempting to retry pet fetch after authorization error...');
            fetchPetDetails();
          }, 3000);
          return;
        }
        
        // Handle other errors
        if (!response.ok) {
          // Try to get the error message from the response
          let errorMessage = 'Failed to fetch pet details';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use the status text
            errorMessage = `Failed to fetch pet details: ${response.statusText || 'Unknown error'}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Check if the data is valid
        if (!data) {
          throw new Error('No pet data returned from API');
        }
        
        // Cache the pet details using the new utility
        petsCache.setPetDetails(petId, data);
        setPet(data);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError(err.message || 'Failed to fetch pet details');
      } finally {
        setLoading(false);
      }
    }

    fetchPetDetails();
  }, [petId, retryCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle missing data gracefully
  const name = pet?.name || 'Unknown';
  const photos = pet?.photos || [];
  const videos = pet?.videos || [];
  const hasMedia = photos.length > 0 || videos.length > 0;
  const description = pet?.description ? decode(pet.description) : 'No description available';
  const organization = pet?.organization_id || 'Unknown';
  const attributes = pet?.attributes || {};
  const environment = pet?.environment || {};
  const tags = pet?.tags || [];
  const breeds = pet?.breeds || {};
  const contact = pet?.contact || {};
  const address = contact?.address || {};
  const fullAddress = [address.city, address.state, address.postcode].filter(Boolean).join(', ');

  // Determine if we're showing a photo or video
  const isVideo = activePhotoIndex >= photos.length && videos.length > 0;
  const currentMedia = isVideo 
    ? videos[activePhotoIndex - photos.length].embed
    : photos[activePhotoIndex]?.full || photos[activePhotoIndex]?.large || photos[activePhotoIndex]?.medium || photos[activePhotoIndex]?.small;
    
  // Total media count
  const totalMediaCount = photos.length + videos.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (enlargedImage) {
        if (e.key === 'Escape') {
          closeEnlargedImage();
        } else if (e.key === 'ArrowLeft' && totalMediaCount > 1 && !isVideo) {
          // Navigate to previous image
          prevPhoto();
        } else if (e.key === 'ArrowRight' && totalMediaCount > 1 && !isVideo) {
          // Navigate to next image
          nextPhoto();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enlargedImage, activePhotoIndex, photos, videos, isVideo]);

  const handleBack = () => {
    router.back();
  };

  const nextPhoto = () => {
    if (pet?.photos?.length > 0 || pet?.videos?.length > 0) {
      const photosLength = pet?.photos?.length || 0;
      const videosLength = pet?.videos?.length || 0;
      setActivePhotoIndex((prev) => (prev + 1) % (photosLength + videosLength));
    }
  };

  const prevPhoto = () => {
    if (pet?.photos?.length > 0 || pet?.videos?.length > 0) {
      const photosLength = pet?.photos?.length || 0;
      const videosLength = pet?.videos?.length || 0;
      setActivePhotoIndex((prev) => (prev - 1 + photosLength + videosLength) % (photosLength + videosLength));
    }
  };

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
    // When image is enlarged, prevent body scrolling
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
    // Re-enable scrolling when modal is closed
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  const handleAdopt = () => {
    if (pet?.url) {
      window.open(pet.url, '_blank');
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Enhanced touch event handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    // Improved threshold for better swipe detection
    const swipeThreshold = 50; // Reduced from 70 to make swiping more responsive
    
    // Check if both touchStart and touchEnd are defined
    if (touchStart === null || touchEnd === null) return;
    
    if (touchStart - touchEnd > swipeThreshold) {
      // Swipe left - go to next photo
      nextPhoto();
    }
    
    if (touchEnd - touchStart > swipeThreshold) {
      // Swipe right - go to previous photo
      prevPhoto();
    }
    
    // Reset touch values after handling
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="large" />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xl text-muted-foreground text-center max-w-md"
        >
          Loading pet details...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-12 mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
              
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  // Force a retry by incrementing the retry counter
                  setRetryCount(count => count + 1);
                }}
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">Pet not found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find this pet. It may have been adopted already!</p>
          <Button onClick={handleBack}>
            View Other Pets
          </Button>
        </div>
      </motion.div>
    );
  }

  // Determine colors based on pet type
  let petTypeColor;
  
  switch (pet.type) {
    case 'Dog':
      petTypeColor = 'bg-blue-500';
      break;
    case 'Cat':
      petTypeColor = 'bg-indigo-500';
      break;
    case 'Bird':
      petTypeColor = 'bg-teal-500';
      break;
    case 'Rabbit':
      petTypeColor = 'bg-purple-500';
      break;
    case 'Horse':
      petTypeColor = 'bg-amber-500';
      break;
    default:
      petTypeColor = 'bg-primary';
  }

  const renderDescription = () => {
    if (!pet?.description) return null;
    
    return (
      <>
        <div 
          ref={descriptionRef}
          className={`text-gray-600 mt-2 overflow-hidden ${!showFullDescription ? 'max-h-[200px]' : ''}`}
          dangerouslySetInnerHTML={{ 
            __html: decode(pet.description || '')
          }}
        />
        
        {/* Only show Read More/Less button if the description is truncated */}
        {isDescriptionTruncated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDescription}
            className="mt-2 text-primary flex items-center"
          >
            {showFullDescription ? 'Read Less' : 'Read More'}
            {showFullDescription ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
          </Button>
        )}
      </>
    );
  };

  return (
    <>
      {/* Back button - only appears when scrolling down */}
      {scrollY > 100 && (
        <motion.button
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ArrowLeft size={20} />
          <span className="mr-1 font-medium">Back</span>
        </motion.button>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 pt-16 lg:py-12 lg:pt-20 max-w-6xl">
        {/* Back button at the top for initial view - now styled the same as the floating button */}
        <motion.button
          onClick={handleBack}
          className="mb-6 bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span className="mr-1 font-medium">Back</span>
        </motion.button>
        
        {/* Swapped order for desktop layout - text left, image right */}
        <div className="flex flex-col lg:flex-row-reverse gap-8">
          {/* Image section - now on right for desktop */}
          {hasMedia && (
            <div className="w-full lg:w-1/2 xl:w-2/5 lg:sticky lg:top-24 lg:self-start">
              <motion.div 
                className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {isVideo ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentMedia }}
                    className="w-full h-full flex items-center justify-center bg-gray-900" 
                  />
                ) : (
                  <div 
                    className="w-full h-full cursor-pointer overflow-hidden relative"
                    onClick={() => handleImageClick(currentMedia)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <Image
                      src={currentMedia}
                      alt={`Photo of ${name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      priority
                    />
                    
                    {/* Add touch-friendly indicator for mobile */}
                    {isMobile && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
                        <span className="bg-white/80 text-black px-4 py-2 rounded-full text-sm font-medium">
                          Tap to enlarge
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Media counter indicator - improved visibility */}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                  {activePhotoIndex + 1} / {totalMediaCount}
                </div>

                {/* Pagination dots for images - improved for mobile */}
                {totalMediaCount > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {Array.from({ length: totalMediaCount }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          i === activePhotoIndex
                            ? 'bg-white scale-110 shadow-md'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Navigation controls - enhanced visibility for all devices */}
                {hasMedia && totalMediaCount > 1 && (
                  <>
                    <motion.button 
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 text-black hover:bg-white transition-all shadow-lg border border-gray-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={isMobile ? 20 : 24} />
                    </motion.button>
                    <motion.button 
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 text-black hover:bg-white transition-all shadow-lg border border-gray-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Next photo"
                    >
                      <ChevronRight size={isMobile ? 20 : 24} />
                    </motion.button>
                  </>
                )}
              </motion.div>
              
              {/* Thumbnails for desktop */}
              {!isMobile && totalMediaCount > 1 && (
                <motion.div 
                  className="hidden lg:flex mt-4 gap-2 overflow-x-auto pb-2 max-w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {photos.map((photo, index) => (
                    <button
                      key={`photo-${index}`}
                      onClick={() => setActivePhotoIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                        index === activePhotoIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={photo.medium || photo.small || photo.large || photo.full}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                  {videos.map((video, index) => (
                    <button
                      key={`video-${index}`}
                      onClick={() => setActivePhotoIndex(photos.length + index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center ${
                        photos.length + index === activePhotoIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span className="text-white text-2xl">▶️</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Pet Details - now on left for desktop */}
          <div className="space-y-6 w-full lg:w-1/2 xl:w-3/5">
            {/* Mobile Name Header */}
            {isMobile && (
              <motion.div 
                className="flex justify-between items-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h1 className="text-3xl font-bold">{name}</h1>
                  <p className="text-muted-foreground">{breeds.primary}{breeds.secondary ? ` / ${breeds.secondary}` : ''}</p>
                </div>
              </motion.div>
            )}

            {/* Desktop Name Header */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-4xl font-bold text-primary">{name}</h1>
                <p className="text-xl text-muted-foreground mt-1">{breeds.primary}{breeds.secondary ? ` / ${breeds.secondary}` : ''}</p>
              </motion.div>
            )}

            {/* Location and Organization */}
            <motion.div 
              className="flex items-center text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-primary/10 rounded-full p-2 mr-3 text-primary">
                <MapPin size={16} />
              </div>
              <span>{fullAddress} • {organization}</span>
            </motion.div>

            {/* Key Attributes - Fixed styling */}
            <motion.div 
              className="flex flex-wrap gap-3 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className={`px-4 py-2 bg-filter text-black rounded-full font-medium shadow-sm`}>
                {pet.age}
              </span>
              <span className="px-4 py-2 bg-filter text-black rounded-full font-medium shadow-sm">
                {pet.gender}
              </span>
              <span className="px-4 py-2 bg-filter text-black rounded-full font-medium shadow-sm">
                {pet.size}
              </span>
              {pet.colors && pet.colors.primary && (
                <span className="px-4 py-2 bg-filter text-black rounded-full font-medium shadow-sm">
                  {pet.colors.primary}
                </span>
              )}
            </motion.div>

            {/* Attributes Section */}
            <motion.div 
              className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold">About {name}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attributes.spayed_neutered && (
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-1.5 mr-2 text-green-600">
                      <Check size={14} />
                    </div>
                    <span>Spayed/Neutered</span>
                  </div>
                )}
                {attributes.house_trained && (
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-1.5 mr-2 text-green-600">
                      <Check size={14} />
                    </div>
                    <span>House Trained</span>
                  </div>
                )}
                {attributes.declawed && (
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-1.5 mr-2 text-green-600">
                      <Check size={14} />
                    </div>
                    <span>Declawed</span>
                  </div>
                )}
                {attributes.special_needs && (
                  <div className="flex items-center">
                    <div className="bg-amber-100 rounded-full p-1.5 mr-2 text-amber-600">
                      <AlertCircle size={14} />
                    </div>
                    <span>Special Needs</span>
                  </div>
                )}
                {attributes.shots_current && (
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-1.5 mr-2 text-green-600">
                      <Check size={14} />
                    </div>
                    <span>Shots Current</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Environment Section - Updated with emojis instead of checkmarks/X */}
            {(environment.children !== null || environment.dogs !== null || environment.cats !== null) && (
              <motion.div 
                className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold">Good With</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                      environment.children 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-rose-100 text-rose-700'
                    } shadow-sm`}>
                      <span className="text-2xl" role="img" aria-label={environment.children ? "Good with children" : "Not good with children"}>
                        {environment.children ? '👶' : '🚫'}
                      </span>
                    </div>
                    <span className="text-sm text-center font-medium">Children</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                      environment.dogs 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-rose-100 text-rose-700'
                    } shadow-sm`}>
                      <span className="text-2xl" role="img" aria-label={environment.dogs ? "Good with dogs" : "Not good with dogs"}>
                        {environment.dogs ? '🐶' : '🚫'}
                      </span>
                    </div>
                    <span className="text-sm text-center font-medium">Dogs</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                      environment.cats 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-rose-100 text-rose-700'
                    } shadow-sm`}>
                      <span className="text-2xl" role="img" aria-label={environment.cats ? "Good with cats" : "Not good with cats"}>
                        {environment.cats ? '🐱' : '🚫'}
                      </span>
                    </div>
                    <span className="text-sm text-center font-medium">Cats</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tags/Personality - Fix text color consistency */}
            {tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl p-6 shadow-md border border-gray-100"
              >
                <h2 className="text-xl font-semibold mb-4">Personality</h2>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag, index) => (
                    <motion.span 
                      key={index} 
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium shadow-sm"
                      whileHover={{ y: -2, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description - Enhanced with read more/less functionality */}
            <motion.div 
              className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold">Meet {name}</h2>
              {renderDescription()}
            </motion.div>

            {/* Additional details section - Simplified into clean cards */}
            <motion.div 
              className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-xl font-semibold">Additional Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pet.breeds && pet.breeds.primary && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-sm text-slate-500 mb-1">Breed</div>
                    <div className="font-medium">{pet.breeds.primary}</div>
                    {pet.breeds && pet.breeds.secondary && (
                      <div className="text-sm text-slate-600 mt-1">Mix: {pet.breeds.secondary}</div>
                    )}
                  </div>
                )}
                
                {pet.coat && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-sm text-slate-500 mb-1">Coat</div>
                    <div className="font-medium">{pet.coat}</div>
                  </div>
                )}

                {pet.colors?.primary && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-sm text-slate-500 mb-1">Color</div>
                    <div className="font-medium">
                      {pet.colors.primary}
                      {pet.colors && pet.colors.secondary && ` & ${pet.colors.secondary}`}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Adoption CTA */}
            <motion.div 
              className="flex flex-wrap gap-4 pt-4 pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleAdopt}
                className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 rounded-2xl shadow-md w-full font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Adopt {name}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enlarged Image Modal - Improved for mobile */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              // Only close if clicking the background, not the image
              if (e.target === e.currentTarget) {
                closeEnlargedImage();
              }
            }}
          >
            {/* Improved close button visibility - positioned at top right corner with better styling */}
            <motion.button 
              className="fixed top-6 right-6 text-white bg-black/70 hover:bg-black/90 rounded-full p-3 transition-colors z-50 shadow-md border border-white/20 flex items-center justify-center"
              onClick={closeEnlargedImage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close image"
              style={{ width: '48px', height: '48px' }} // Increased size
            >
              <X size={28} />
            </motion.button>

            {/* Mobile-specific helper text */}
            {isMobile && (
              <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
                <span className="bg-black/70 text-white text-sm px-3 py-1.5 rounded-full">
                  Tap background to close
                </span>
              </div>
            )}

            <motion.div 
              className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
                <Image
                  src={enlargedImage}
                  alt={`Photo of ${name}`}
                  className="object-contain max-h-full max-w-full"
                  width={1200}
                  height={900}
                  priority
                />
              </div>

              {/* Navigation controls for enlarged view if there are multiple images */}
              {totalMediaCount > 1 && !isVideo && (
                <>
                  <motion.button 
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                      // Update enlarged image to the new active photo
                      const newIndex = activePhotoIndex === 0 ? totalMediaCount - 1 : activePhotoIndex - 1;
                      if (newIndex < photos.length) {
                        setEnlargedImage(photos[newIndex]?.full || photos[newIndex]?.large || photos[newIndex]?.medium);
                      }
                    }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 md:p-4 text-black hover:bg-white transition-all shadow-lg z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={isMobile ? 20 : 28} />
                  </motion.button>
                  <motion.button 
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                      // Update enlarged image to the new active photo
                      const newIndex = (activePhotoIndex + 1) % totalMediaCount;
                      if (newIndex < photos.length) {
                        setEnlargedImage(photos[newIndex]?.full || photos[newIndex]?.large || photos[newIndex]?.medium);
                      }
                    }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 md:p-4 text-black hover:bg-white transition-all shadow-lg z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={isMobile ? 20 : 28} />
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}