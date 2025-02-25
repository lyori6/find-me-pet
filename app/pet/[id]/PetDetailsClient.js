'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { decode } from 'html-entities';
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

  // Touch handling for image carousel
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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
      setIsDescriptionTruncated(content.scrollHeight > 200);
      
      // Debug - check actual description length
      console.log('Description length:', pet.description.length);
      console.log('Description scrollHeight:', content.scrollHeight);
    }
  }, [pet]);

  useEffect(() => {
    async function fetchPetDetails() {
      try {
        const response = await fetch(`/api/pet/${petId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch pet details');
        }

        const data = await response.json();
        setPet(data.animal);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPetDetails();
  }, [petId]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const nextPhoto = () => {
    if (pet?.photos?.length > 0 || pet?.videos?.length > 0) {
      setActivePhotoIndex((prev) => (prev + 1) % (pet.photos.length + pet.videos.length));
    }
  };

  const prevPhoto = () => {
    if (pet?.photos?.length > 0 || pet?.videos?.length > 0) {
      setActivePhotoIndex((prev) => (prev - 1 + pet.photos.length + pet.videos.length) % (pet.photos.length + pet.videos.length));
    }
  };

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const handleAdopt = () => {
    if (pet?.url) {
      window.open(pet.url, '_blank');
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 70) {
      // Swipe left
      nextPhoto();
    }
    
    if (touchEnd - touchStart > 70) {
      // Swipe right
      prevPhoto();
    }
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="bg-destructive/10 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleBack}>
            Go Back
          </Button>
        </div>
      </motion.div>
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
                    className="w-full h-full" 
                  />
                ) : (
                  <div 
                    className="w-full h-full cursor-pointer overflow-hidden"
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
                  </div>
                )}

                {/* Media counter indicator */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                  {activePhotoIndex + 1} / {totalMediaCount}
                </div>

                {/* Pagination dots for images */}
                {totalMediaCount > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
                    {Array.from({ length: totalMediaCount }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                          i === activePhotoIndex
                            ? 'bg-white scale-110'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Navigation controls - enhanced visibility */}
                {hasMedia && totalMediaCount > 1 && (
                  <>
                    <motion.button 
                      onClick={prevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 text-black hover:bg-white transition-all shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft size={24} />
                    </motion.button>
                    <motion.button 
                      onClick={nextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 text-black hover:bg-white transition-all shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight size={24} />
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
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black transition-all duration-200 ${
                        photos.length + index === activePhotoIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white border-b-4 border-b-transparent ml-1"></div>
                        </div>
                      </div>
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
              <div className="prose max-w-none">
                <div 
                  className={`text-base leading-relaxed text-gray-700 ${!showFullDescription ? "max-h-[200px] overflow-hidden relative" : ""}`}
                  ref={descriptionRef}
                >
                  {description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                  
                  {!showFullDescription && isDescriptionTruncated && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                
                {isDescriptionTruncated && (
                  <button 
                    onClick={toggleDescription}
                    className="mt-2 text-primary font-medium hover:underline focus:outline-none flex items-center"
                  >
                    {showFullDescription ? (
                      <>Show less <ChevronUp size={16} className="ml-1" /></>
                    ) : (
                      <>Read more <ChevronDown size={16} className="ml-1" /></>
                    )}
                  </button>
                )}
              </div>
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
                {pet.breeds.primary && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-sm text-slate-500 mb-1">Breed</div>
                    <div className="font-medium">{pet.breeds.primary}</div>
                    {pet.breeds.secondary && (
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
                      {pet.colors.secondary && ` & ${pet.colors.secondary}`}
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

      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeEnlargedImage}
          >
            <motion.button 
              className="absolute top-6 right-6 text-white bg-black/40 rounded-full p-3 hover:bg-black/60 transition-colors"
              onClick={closeEnlargedImage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>
            <motion.div 
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Image
                src={enlargedImage}
                alt={`Photo of ${name}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}