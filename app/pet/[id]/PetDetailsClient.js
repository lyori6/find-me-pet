'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { decode } from 'html-entities';
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
  const description = pet?.description ? decode(pet.description) : 'No description available';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button at the top */}
        <button
          onClick={handleBack}
          className="mb-6 bg-white shadow-md rounded-full p-3 hover:bg-gray-100 transition-colors flex items-center gap-2 w-fit"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="mr-1 font-medium">Back</span>
        </button>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-muted-foreground">Loading pet details...</p>
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
            {/* Pet Name and Breed - Now at the top */}
            <div className="w-full">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">{name}</h1>
              <p className="text-lg text-muted-foreground mt-1">{breeds.primary}{breeds.secondary ? ` / ${breeds.secondary}` : ''}</p>
            </div>
            
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
                  <div className="flex items-center text-muted-foreground mb-6">
                    <div className="bg-primary/10 rounded-full p-2 mr-4 text-primary">
                      <MapPin size={16} />
                    </div>
                    <span className="ml-2">{fullAddress}{organization ? ` • ${organization}` : ''}</span>
                  </div>
                )}
                
                {/* Description - Now below the image */}
                {pet?.description && (
                  <div className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100 mb-6">
                    <h2 className="text-xl font-semibold">Meet {name}</h2>
                    {renderDescription()}
                  </div>
                )}
                
                {/* Videos Section */}
                {hasVideos && (
                  <div className="w-full mt-4 mb-6 bg-white rounded-3xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold mb-3">Videos</h3>
                    <div className="space-y-4">
                      {videos.map((video, index) => (
                        <div 
                          key={`video-${index}`}
                          className="relative rounded-xl overflow-hidden aspect-video bg-slate-100"
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
                {/* Key Attributes */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="px-4 py-2 bg-filter text-black rounded-full font-medium shadow-sm">
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
                </div>

                {/* Attributes Section */}
                {Object.values(attributes).some(value => value) && (
                  <div className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100">
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
                  </div>
                )}

                {/* Environment Section */}
                {(environment.children !== null || environment.dogs !== null || environment.cats !== null) && (
                  <div className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100">
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
                  </div>
                )}

                {/* Tags/Personality */}
                {tags.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Personality</h2>
                    <div className="flex flex-wrap gap-3">
                      {tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional details section */}
                <div className="bg-white rounded-3xl p-6 space-y-4 shadow-md border border-gray-100">
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
                </div>

                {/* Adoption CTA */}
                <div className="flex flex-wrap gap-4 pt-4 pb-8">
                  <button
                    onClick={handleAdopt}
                    className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 rounded-2xl shadow-md w-full font-medium"
                  >
                    Adopt {name}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}