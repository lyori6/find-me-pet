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
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();
  const headerRef = useRef(null);
  
  // Use URL param or fallback to localStorage
  const zipCode = initialZipCode || getZipCode();
  
  // Add pagination state
  const [displayCount, setDisplayCount] = useState(12);
  
  useEffect(() => {
    if (!zipCode) {
      setError('Please provide a zip code');
      setLoading(false);
      return;
    }
    
    async function fetchPets() {
      try {
        // Update API call to only fetch adoptable pets
        const response = await fetch(`/api/search?zipCode=${zipCode}&status=adoptable`);
        
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
  }, [zipCode]);
  
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
  
  // Filter pets based on active filter
  const filteredPets = pets.filter(pet => {
    // Only show adoptable pets
    if (pet.status !== 'adoptable') return false;
    
    if (activeFilter === 'all') return true;
    if (activeFilter === 'dogs') return pet.type === 'Dog';
    if (activeFilter === 'cats') return pet.type === 'Cat';
    if (activeFilter === 'other') return pet.type !== 'Dog' && pet.type !== 'Cat';
    return true;
  });
  
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
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            className="rounded-full px-6"
          >
            All Pets
          </Button>
          <Button
            variant={activeFilter === 'dogs' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('dogs')}
            className="rounded-full px-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.687-.1-1.016A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Dogs
          </Button>
          <Button
            variant={activeFilter === 'cats' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('cats')}
            className="rounded-full px-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Cats
          </Button>
          <Button
            variant={activeFilter === 'other' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('other')}
            className="rounded-full px-6"
          >
            Other Pets
          </Button>
        </div>
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