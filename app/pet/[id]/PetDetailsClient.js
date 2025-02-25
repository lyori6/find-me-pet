'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { decode } from 'html-entities';

export default function PetDetailsClient({ petId }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg text-muted-foreground">Loading pet details...</p>
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
          <Button onClick={handleBack}>Go Back</Button>
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
          <p className="text-muted-foreground mb-6">We couldn't find this pet. It may have been adopted!</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </motion.div>
    );
  }

  const name = pet.name || 'Unknown';
  const photos = pet.photos || [];
  const videos = pet.videos || [];
  const hasMedia = photos.length > 0 || videos.length > 0;
  const breed = pet.breeds?.primary || 'Unknown breed';
  const age = pet.age || 'Unknown';
  const gender = pet.gender || 'Unknown';
  const size = pet.size || 'Unknown';
  const description = pet?.description ? decode(pet.description) : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <Button
        onClick={handleBack}
        variant="ghost"
        className="mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </Button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
        <div className="relative">
          {hasMedia && (
            <div className="relative mb-6">
              {videos.length > 0 && activePhotoIndex >= photos.length ? (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <div dangerouslySetInnerHTML={{ __html: videos[activePhotoIndex - photos.length].embed }} className="w-full h-full" />
                </div>
              ) : (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <div style={{ paddingTop: '75%' }} className="relative w-full">
                    <Image
                      src={photos[activePhotoIndex].large}
                      alt={`Photo ${activePhotoIndex + 1} of ${name}`}
                      fill
                      className="object-contain cursor-pointer"
                      onClick={() => handleImageClick(photos[activePhotoIndex].large)}
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          {hasMedia && (photos.length + videos.length > 1) && (
            <div className="flex justify-center items-center gap-4 mb-6">
              <Button
                onClick={prevPhoto}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              <span className="text-sm text-muted-foreground">
                {activePhotoIndex + 1} of {photos.length + videos.length}
              </span>

              <Button
                onClick={nextPhoto}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}

          {/* Thumbnails */}
          {hasMedia && (photos.length + videos.length > 1) && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {photos.map((photo, index) => (
                <button
                  key={photo.large}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    activePhotoIndex === index ? 'border-2 border-primary' : 'border-2 border-transparent'
                  }`}
                  style={{ width: '80px', height: '80px' }}
                >
                  <Image
                    src={photo.small}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhotoIndex(photos.length + index)}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    activePhotoIndex === photos.length + index ? 'border-2 border-primary' : 'border-2 border-transparent'
                  }`}
                  style={{ width: '80px', height: '80px' }}
                >
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{name}</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
            {pet.breeds.primary}
          </span>
          <span className="px-4 py-2 bg-secondary/10 text-secondary rounded-full font-medium">
            {pet.age}
          </span>
          <span className="px-4 py-2 bg-muted rounded-full font-medium">
            {pet.gender}
          </span>
          {pet.size && (
            <span className="px-4 py-2 bg-muted rounded-full font-medium">
              {pet.size}
            </span>
          )}
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-lg leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleAdopt}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            Adopt {name}
          </Button>

          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
          >
            View Other Pets
          </Button>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeEnlargedImage}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-[calc(100vh-8rem)] max-w-7xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={enlargedImage}
                alt="Enlarged pet photo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
              />
              <button
                onClick={closeEnlargedImage}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}