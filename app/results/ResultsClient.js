'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getZipCode } from '../utils/storage';
import { petsCache } from '../utils/cache';
import PetCard from '../components/PetCard';
import { Button } from '@/components/ui/button';
import AiRecommendation from '@/components/ai-recommendation';
import LoadingSpinner from '../components/LoadingSpinner'; // Correct import path

export default function ResultsClient({ initialZipCode }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  const [recommendedPetId, setRecommendedPetId] = useState(null);
  // Filters are intentionally locked (disabled) due to ongoing issues with the filter implementation
  // TODO: Keep filters locked until the following issues are resolved:
  // 1. Proper handling of multiple pet type selections
  // 2. Synchronization between URL parameters and filter state
  // 3. Edge cases with filter combinations
  const [filtersLocked, setFiltersLocked] = useState(true);
  const router = useRouter();
  const headerRef = useRef(null);
  
  // Use URL param or fallback to localStorage
  const zipCode = initialZipCode || getZipCode();
  
  // Add pagination state
  const [displayCount, setDisplayCount] = useState(12);

  // Initialize state from URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const petTypesParam = urlParams.get('petTypes');
    
    let types = [];
    if (petTypesParam && petTypesParam !== 'any' && petTypesParam !== 'null') {
      types = petTypesParam.split(',').map(type => {
        // First convert to singular form if plural
        const singular = type.toLowerCase().replace(/s$/, '');
        // Then capitalize first letter
        return singular.charAt(0).toUpperCase() + singular.slice(1);
      });
    }
    setSelectedPetTypes(types);
  }, []); // Only run once on mount

  // Separate effect for fetching pets when dependencies change
  useEffect(() => {
    fetchPets();
  }, [zipCode, selectedPetTypes]);

  async function fetchPets() {
    if (!zipCode) return;
    
    try {
      setLoading(true); // Set loading at the start
      setError(null);

      // Check cache first using the new utility
      const cachedResults = petsCache.getSearchResults(zipCode, selectedPetTypes);
      if (cachedResults) {
        setPets(cachedResults);
        setLoading(false);
        return;
      }

      const petTypesQuery = selectedPetTypes.length > 0 
        ? `&petTypes=${selectedPetTypes.join(',')}`
        : '';
      
      const response = await fetch(`/api/search?zipCode=${zipCode}&status=adoptable${petTypesQuery}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }
      
      const data = await response.json();
      
      if (!data.animals || data.animals.length === 0) {
        setError('No pets found in your area. Try adjusting your search criteria.');
        setPets([]);
      } else {
        setPets(data.animals);
        // Cache the results using the new utility
        petsCache.setSearchResults(zipCode, selectedPetTypes, data.animals);
      }
    } catch (err) {
      setError(err.message);
      setPets([]);
    } finally {
      setLoading(false); // Always set loading to false when done
    }
  }

  // Loading animation component
  const LoadingSpinnerComponent = () => (
    <motion.div 
      className="flex flex-col items-center justify-center py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner size="large" text="Finding pets near you..." textPosition="bottom" />
    </motion.div>
  );

  const renderFilterButtons = () => {
    const allTypes = ['Dog', 'Cat', 'Rabbit'];
    return (
      <div className="flex gap-2 mb-4">
        {allTypes.map((type) => (
          <Button
            key={type}
            disabled={true}
            variant={selectedPetTypes.includes(type) ? 'default' : 'outline'}
            className="cursor-not-allowed opacity-70"
          >
            {type}s {selectedPetTypes.includes(type) && '✓'}
          </Button>
        ))}
      </div>
    );
  };

  // Filter pets based on selected types
  const filteredPets = pets.filter(pet => {
    if (selectedPetTypes.length === 0) return true; // Show all if no filters
    return selectedPetTypes.includes(pet.type);
  });

  const orderedPets = useMemo(() => {
    if (!recommendedPetId || filteredPets.length === 0) {
      return filteredPets;
    }
    
    // Find the recommended pet
    const recommendedPet = filteredPets.find(pet => pet.id === recommendedPetId);
    
    if (!recommendedPet) {
      return filteredPets;
    }
    
    // Create a new array with the recommended pet first, followed by all other pets
    return [
      recommendedPet,
      ...filteredPets.filter(pet => pet.id !== recommendedPetId)
    ];
  }, [filteredPets, recommendedPetId]);

  const availableTypes = [...new Set(pets.map(pet => pet.type))];
  const showAllTypes = selectedPetTypes.length === 0;

  // Only show filter tags for selected pet types or all if none selected
  const filterTags = showAllTypes ? availableTypes : selectedPetTypes;

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 20) {
          headerRef.current.classList.add('backdrop-blur-lg', 'bg-white/80', 'shadow-sm');
        } else {
          headerRef.current.classList.remove('backdrop-blur-lg', 'bg-white/80', 'shadow-sm');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchAgain = () => {
    router.push('/search');
  };

  const handleFilterClick = (type) => {
    if (selectedPetTypes.includes(type)) {
      setSelectedPetTypes(selectedPetTypes.filter(t => t !== type));
    } else {
      setSelectedPetTypes([...selectedPetTypes, type]);
    }
  };

  return (
    <div>
      {/* Filter section */}
      <div ref={headerRef} className="sticky top-0 backdrop-blur z-10 border-b py-3 pt-2 pb-4" style={{
        backgroundColor: 'rgba(248, 249, 250, 0.7)', // Lighter gray that blends with background
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        {renderFilterButtons()}
      </div>

      {/* Results section */}
      <div className="mt-8">
        {/* AI Recommendation section - always show at the top when we have pets */}
        {filteredPets.length > 0 && (
          <div className="mb-8">
            <AiRecommendation 
              selectedTypes={selectedPetTypes}
              zipCode={zipCode}
              filteredAnimals={filteredPets}
              onRecommendationLoaded={(recommendation) => {
                // Extract the pet ID from the recommendation and set it in state
                if (recommendation && recommendation.petId) {
                  setRecommendedPetId(recommendation.petId);
                }
              }}
              onRetry={() => {
                // Clear the localStorage cache
                localStorage.removeItem("aiRecommendation");
              }}
            />
          </div>
        )}

        {/* Pet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-6">
          {orderedPets.slice(0, displayCount).map(pet => (
            <div key={pet.id} className="flex justify-center p-2">
              <PetCard 
                pet={pet} 
                isTopMatch={pet.id === recommendedPetId}
              />
            </div>
          ))}
        </div>

        {/* Loading spinner shown at the bottom */}
        <AnimatePresence>
          {loading && <LoadingSpinnerComponent />}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="w-full p-6 mt-6 text-red-600 bg-red-50 rounded-lg text-center flex flex-col items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="mb-4">{error}</p>
              {error.includes('No pets found') && (
                <Button
                  onClick={() => window.open('https://www.google.com/search?q=Animal+Shelters+Near+Me', '_blank')}
                  variant="secondary"
                  size="lg"
                  className="mt-2"
                >
                  Find Animal Shelters Around Me
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load more button */}
        {filteredPets.length > displayCount && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => setDisplayCount(prev => prev + 12)}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Load More Pets
            </Button>
          </div>
        )}

        {/* No results message */}
        {filteredPets.length === 0 && !loading && !error && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg text-gray-600 mb-4">No pets found. Try adjusting your search.</p>
            <Button
              onClick={() => window.open('https://www.google.com/search?q=Animal+Shelters+Near+Me', '_blank')}
              variant="secondary"
              size="lg"
              className="mt-2"
            >
              Find Animal Shelters Around Me
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}