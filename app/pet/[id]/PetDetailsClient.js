'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { decodeHtmlEntities } from '@/app/utils/textUtils';
import { petsCache } from '@/app/utils/cache';
import SimpleGallery from '@/app/components/SimpleGallery';
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
  Heart,
  Film,
  Info,
  Users,
  Smile,
  FileText,
  Ruler,
  User,
  Palette,
  Home,
  Scissors,
  AlertTriangle,
  Syringe,
  Shield
} from 'lucide-react';

export default function PetDetailsClient({ petId }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  // Add a ref to track loading start time
  const loadingStartTimeRef = useRef(null);
  // Minimum time to show loading spinner (in ms)
  const MIN_LOADING_TIME = 800;

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
      // Record the start time of loading
      loadingStartTimeRef.current = Date.now();
      console.log('Loading started at:', loadingStartTimeRef.current);
      
      setLoading(true);
      setError(null);
      
      // Add a small delay to ensure the loading state is rendered
      // This helps with the hydration timing issue
      await new Promise(resolve => setTimeout(resolve, 50));
      
      try {
        // Check cache first using the new utility
        const cachedPet = petsCache.getPetDetails(petId);
        if (cachedPet) {
          console.log('Pet found in cache:', petId);
          setPet(cachedPet);
          
          // Even with cached data, ensure loading spinner shows for minimum time
          const elapsedTime = Date.now() - loadingStartTimeRef.current;
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
          
          console.log('Cache hit - Elapsed time:', elapsedTime, 'ms, Will show spinner for additional:', remainingTime, 'ms');
          
          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }
          
          setLoading(false);
          return;
        }
        
        console.log('Pet not found in cache, fetching from API:', petId);
        // If not in cache, fetch from API
        const response = await fetch(`/api/pet/${petId}`);
        
        // Check for 401 Unauthorized (token issue)
        if (response.status === 401) {
          console.error('Authorization error with pet service');
          setError('Authorization error with pet service. Please try refreshing the page.');
          
          // Ensure loading spinner shows for minimum time
          const elapsedTime = Date.now() - loadingStartTimeRef.current;
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
          
          if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
          }
          
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
        // Ensure loading spinner shows for minimum time
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        
        console.log('Fetch completed - Elapsed time:', elapsedTime, 'ms, Will show spinner for additional:', remainingTime, 'ms');
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        setLoading(false);
      }
    }

    fetchPetDetails();
  }, [petId, retryCount]);

  // Format the address to avoid duplicate zip codes
  const formatAddress = () => {
    if (!pet || !pet.contact || !pet.contact.address) return '';
    
    const { address } = pet.contact;
    const parts = [];
    
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postcode) parts.push(address.postcode);
    
    // Return only the first part of the address to avoid duplicates
    return parts.join(', ');
  };
  
  const fullAddress = formatAddress();
  
  // Get organization name without location codes
  const getOrganizationName = () => {
    if (!pet || !pet.organization) return '';
    
    // Remove any location codes that might appear at the end (like CA94)
    const orgName = pet.organization;
    // Remove state+zip pattern if it exists at the end of the string
    return orgName.replace(/\s*[A-Z]{2}\d+\s*$/, '');
  };
  
  const organization = getOrganizationName();

  // Handle missing data gracefully
  const name = pet?.name || 'Unknown';
  const photos = pet?.photos || [];
  const videos = pet?.videos || [];
  const hasPhotos = photos.length > 0;
  const hasVideos = videos.length > 0;
  const description = pet?.description ? decodeHtmlEntities(pet.description) : 'No description available';
  const attributes = pet?.attributes || {};
  const environment = pet?.environment || {};
  const tags = pet?.tags || [];
  const breeds = pet?.breeds || {};
  const contact = pet?.contact || {};
  const address = contact?.address || {};

  const handleBack = () => {
    router.back();
  };

  const handleAdopt = () => {
    if (pet?.url) {
      window.open(pet.url, '_blank');
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setLoading(true);
    setError(null);
    setRetryCount(count => count + 1);
    setTimeout(() => {
      setIsRetrying(false);
    }, 3000);
  };

  // Format the description to show only 340 characters initially
  const formatDescription = (text) => {
    if (!text) return '';
    
    const decodedText = decodeHtmlEntities(text);
    
    if (decodedText.length <= 340 || showFullDescription) {
      return decodedText;
    }
    
    return decodedText.substring(0, 340) + '...';
  };

  const renderDescription = () => {
    if (!pet?.description) return null;
    
    const formattedDescription = formatDescription(pet.description);
    const isLongDescription = pet.description.length > 340;
    
    return (
      <>
        <div className="relative">
          <div 
            ref={descriptionRef}
            className="text-gray-600 mt-2 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: formattedDescription
            }}
          />
        </div>
        
        {/* Only show Read More button if the description is longer than 340 characters and not expanded */}
        {isLongDescription && !showFullDescription && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDescription}
            className="mt-2 flex items-center font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Read More
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Back button and pet name - Repositioned back button */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="bg-white shadow-md hover:shadow-lg transition-all rounded-lg px-4 py-2 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-700 mr-2" />
              <span className="text-gray-700 font-medium">Back</span>
            </button>
          </div>
          <div className="mb-2">
            {loading ? (
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Loading...</h1>
            ) : (
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{name}</h1>
            )}
            {breeds && breeds.primary && (
              <p className="text-gray-600 mt-1">{breeds.primary}{breeds.secondary ? ` / ${breeds.secondary}` : ''}</p>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            {/* Single spinner implementation */}
            <div style={{ opacity: 1 }}>
              <LoadingSpinner 
                size="large" 
                text={pet?.name ? `Getting information about ${pet.name}...` : "Loading pet details..."}
                textPosition="bottom"
              />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-rose-500 mb-4">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Pet</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack}>
                Go Back
              </Button>
              <Button onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Main content area */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Image section */}
              <div className="w-full lg:w-1/2">
                {/* Photo Gallery */}
                {hasPhotos && (
                  <div className="w-full mb-6">
                    <SimpleGallery 
                      photos={photos} 
                      petName={name}
                      className="shadow-lg"
                    />

                    {/* Thumbnails for desktop */}
                    {!isMobile && photos.length > 1 && (
                      <div className="hidden lg:flex mt-4 gap-2 overflow-x-auto pb-2 max-w-full">
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
                      </div>
                    )}
                  </div>
                )}
                
                {/* Location and Organization - Now below the image with more spacing */}
                {fullAddress && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                      Location
                    </h2>
                    <div className="flex items-center text-gray-600">
                      <span>{fullAddress}{organization ? ` • ${organization}` : ''}</span>
                    </div>
                  </div>
                )}
                
                {/* Description - Now below the image */}
                {pet?.description && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                      <Heart size={20} className="mr-2 text-primary" />
                      Meet {name}
                    </h2>
                    {renderDescription()}
                  </div>
                )}
                
                {/* Videos Section */}
                {hasVideos && (
                  <div className="w-full mt-4 mb-6 bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                      <Film size={20} className="mr-2 text-primary" />
                      Videos
                    </h3>
                    <div className="space-y-4">
                      {videos.map((video, index) => (
                        <div 
                          key={`video-${index}`}
                          className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 shadow-sm"
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: video.embed }}
                            className="w-full h-full" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Details section */}
              <div className="w-full lg:w-1/2 space-y-6">
                {/* Attributes Section - Simplified with universal cards */}
                {Object.values(attributes).some(value => value) && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden mb-5 hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <div className="relative z-10">
                      <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                        <Info size={20} className="mr-2 text-primary" />
                        About {name}
                      </h2>
                      
                      {/* Key Attributes - Grouped with dividers */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Information</h3>
                        <div className="flex flex-wrap gap-3 mb-4 justify-start">
                          {pet.age && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Age: {pet.age}</span>
                            </div>
                          )}
                          {pet.gender && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Gender: {pet.gender}</span>
                            </div>
                          )}
                          {pet.size && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Size: {pet.size}</span>
                            </div>
                          )}
                          {pet.colors && pet.colors.primary && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Color: {pet.colors.primary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Medical Information with subtle divider */}
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Medical Information</h3>
                        <div className="flex flex-wrap gap-3 justify-start">
                          {attributes.spayed_neutered && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Spayed/Neutered</span>
                            </div>
                          )}
                          {attributes.house_trained && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>House Trained</span>
                            </div>
                          )}
                          {attributes.declawed && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Declawed</span>
                            </div>
                          )}
                          {attributes.special_needs && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Special Needs</span>
                            </div>
                          )}
                          {attributes.shots_current && (
                            <div className="px-4 py-2.5 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-lg font-medium border border-primary/30 shadow-sm hover:shadow-md hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 flex items-center">
                              <span>Shots Current</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Environment Section - Improved to consistently show compatibility */}
                {(environment.children !== null || environment.dogs !== null || environment.cats !== null) && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden mb-5 hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <div className="relative z-10">
                      <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                        <Users size={20} className="mr-2 text-primary" />
                        Good With
                      </h2>
                      
                      {/* Grid layout for environment */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                            environment.children === true
                              ? 'bg-green-100 text-green-600 border border-green-200' 
                              : 'bg-red-100 text-red-600 border border-red-200'
                          }`}>
                            {environment.children === true ? <Check size={20} /> : <X size={20} />}
                          </div>
                          <span className="font-medium">Children</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {environment.children === true
                              ? "Good with children" 
                              : environment.children === false
                                ? "Prefers homes without children"
                                : "No information available"}
                          </span>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                            environment.dogs === true
                              ? 'bg-green-100 text-green-600 border border-green-200' 
                              : 'bg-red-100 text-red-600 border border-red-200'
                          }`}>
                            {environment.dogs === true ? <Check size={20} /> : <X size={20} />}
                          </div>
                          <span className="font-medium">Dogs</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {environment.dogs === true
                              ? "Good with dogs" 
                              : environment.dogs === false
                                ? "Prefers homes without dogs"
                                : "No information available"}
                          </span>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                            environment.cats === true
                              ? 'bg-green-100 text-green-600 border border-green-200' 
                              : 'bg-red-100 text-red-600 border border-red-200'
                          }`}>
                            {environment.cats === true ? <Check size={20} /> : <X size={20} />}
                          </div>
                          <span className="font-medium">Cats</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {environment.cats === true
                              ? "Good with cats" 
                              : environment.cats === false
                                ? "Prefers homes without cats"
                                : "No information available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags/Personality - With consistent gray text */}
                {tags.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden mb-5 hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <div className="relative z-10">
                      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                        <Smile size={20} className="mr-2 text-primary" />
                        Personality
                      </h2>
                      
                      {/* Flex layout for personality traits */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {tags.map((tag, index) => {
                          return (
                            <div 
                              key={index}
                              className="px-4 py-2 bg-gray-100 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                            >
                              <span className="font-medium text-gray-700">{tag}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Additional details section - Side by side cards */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden mb-5 hover:shadow-lg transition-shadow duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                      <FileText size={20} className="mr-2 text-primary" />
                      Additional Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {pet.breeds && pet.breeds.primary && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Breed</h3>
                          <p className="font-medium text-gray-800">{breeds.primary}{breeds.secondary ? ` / ${breeds.secondary}` : ''}</p>
                        </div>
                      )}
                      {pet.coat && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Coat</h3>
                          <p className="font-medium text-gray-800">{pet.coat}</p>
                        </div>
                      )}
                      {pet.colors && pet.colors.primary && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary">
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</h3>
                          <p className="font-medium text-gray-800">
                            {pet.colors.primary}
                            {pet.colors.secondary ? `, ${pet.colors.secondary}` : ''}
                            {pet.colors.tertiary ? `, ${pet.colors.tertiary}` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adoption CTA */}
                <div className="pt-4 pb-8">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    <h2 className="text-xl font-bold mb-5 text-gray-800 text-center">Ready to Welcome {name} Home?</h2>
                    <button
                      onClick={handleAdopt}
                      className="bg-gradient-to-r from-primary to-secondary text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl mx-auto block w-3/4 font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Adopt {name}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}