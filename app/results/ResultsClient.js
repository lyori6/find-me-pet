'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getZipCode } from '../utils/storage';
import LoadingSpinner from '../components/LoadingSpinner';
import PetCard from '../components/PetCard';
import { Button } from '@/components/ui/button';

export default function ResultsClient({ initialZipCode }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
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
      types = petTypesParam.split(',')
        .filter(Boolean)
        .map(type => {
          const singular = type.toLowerCase().endsWith('s') ? type.slice(0, -1) : type;
          return singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
        });
    }
    
    // Always lock filters regardless of selection
    setFiltersLocked(true);
    setSelectedPetTypes(types);
  }, [zipCode]); // Remove window.location.search dependency

  // Add separate effect for fetching pets
  useEffect(() => {
    if (!zipCode) {
      setError('Please provide a zip code');
      setLoading(false);
      return;
    }

    async function fetchPets() {
      try {
        const petTypesQuery = selectedPetTypes.length > 0 
          ? `&petTypes=${selectedPetTypes.join(',')}`
          : '';
        
        const response = await fetch(`/api/search?zipCode=${zipCode}&status=adoptable${petTypesQuery}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch pets');
        }
        
        const data = await response.json();
        setPets(data.animals || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPets();
  }, [zipCode, selectedPetTypes]);

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
          Finding adorable pets near you...
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
          <Button onClick={handleSearchAgain}>
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div 
        ref={headerRef}
        className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg py-6 transition-all duration-200 mb-8 rounded-xl"
      >
        {renderFilterButtons()}
      </div>

      {/* Results Grid */}
      <div className="mt-6">
        {filteredPets.length > 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground mb-6"
          >
            Showing {filteredPets.length} adoptable pets {zipCode ? `near ${zipCode}` : ''}
          </motion.p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPets.slice(0, displayCount).map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>

        {/* Load More Button - Added more top margin */}
        {filteredPets.length > displayCount && (
          <div className="mt-16 flex justify-center">
            <Button
              onClick={() => setDisplayCount(prev => prev + 12)}
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-lg border-2 hover:bg-muted/50 transition-all"
            >
              Load More Pets
            </Button>
          </div>
        )}

        {filteredPets.length === 0 && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-muted rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">No adoptable pets found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search in a different area.</p>
              <Button onClick={handleSearchAgain} size="lg" className="px-6">Search Again</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}