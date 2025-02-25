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
  
  useEffect(() => {
    if (!zipCode) {
      setError('Please provide a zip code');
      setLoading(false);
      return;
    }
    
    async function fetchPets() {
      try {
        const response = await fetch(`/api/search?zipCode=${zipCode}`);
        
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
        className="sticky top-0 z-10 bg-white py-4 transition-all duration-200"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            className="rounded-full"
          >
            All Pets
          </Button>
          <Button
            variant={activeFilter === 'dogs' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('dogs')}
            className="rounded-full"
          >
            Dogs
          </Button>
          <Button
            variant={activeFilter === 'cats' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('cats')}
            className="rounded-full"
          >
            Cats
          </Button>
          <Button
            variant={activeFilter === 'other' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('other')}
            className="rounded-full"
          >
            Other Pets
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>

        {filteredPets.length === 0 && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-2">No pets found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search in a different area.</p>
              <Button onClick={handleSearchAgain}>Search Again</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 