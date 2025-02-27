'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getZipCode } from '../utils/storage';
import { petsCache } from '../utils/cache';
import PetCard from '../components/PetCard';
import { Button } from '@/components/ui/button';

export default function FilteredResultsClient({ initialZipCode }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  // Filters are enabled in this alternative flow
  const [filtersLocked, setFiltersLocked] = useState(false);
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
  const LoadingSpinner = () => (
    <motion.div 
      className="flex flex-col items-center justify-center py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  const renderFilterButtons = () => {
    const allTypes = ['Dog', 'Cat', 'Rabbit'];
    return (
      <div className="flex gap-2 mb-4">
        {allTypes.map((type) => (
          <Button
            key={type}
            onClick={() => handleFilterClick(type)}
            disabled={filtersLocked}
            variant={selectedPetTypes.includes(type) ? 'default' : 'outline'}
            className={filtersLocked ? "cursor-not-allowed opacity-70" : ""}
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
      <div ref={headerRef} className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b py-4">
        {renderFilterButtons()}
      </div>

      {/* Results section */}
      <div className="mt-6">
        {/* Pet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPets.slice(0, displayCount).map(pet => (
            <PetCard 
              key={pet.id} 
              pet={pet}
              isTopMatch={false} // No top match in this view
            />
          ))}
        </div>

        {/* Loading spinner shown at the bottom */}
        <AnimatePresence>
          {loading && <LoadingSpinner />}
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
