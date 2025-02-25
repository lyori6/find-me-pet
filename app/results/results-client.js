'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useZipCode } from '../context/ZipCodeContext';
import { useSearchParams } from 'next/navigation';

export default function ResultsClient() {
  console.log('ResultsClient: Component mounted');
  
  const { zipCode, updateZipCode, isInitialized } = useZipCode();
  const searchParams = useSearchParams();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('ResultsClient: Initial render state:', {
    zipCode,
    isInitialized,
    loading,
    error
  });

  // Sync URL params with context when component mounts
  useEffect(() => {
    const urlZipCode = searchParams?.get('zipCode');
    console.log('ResultsClient: URL params effect', {
      urlZipCode,
      contextZipCode: zipCode,
      isInitialized
    });

    if (isInitialized && urlZipCode && urlZipCode !== zipCode) {
      console.log('ResultsClient: Updating context with URL zip code:', urlZipCode);
      updateZipCode(urlZipCode);
    }
  }, [searchParams, zipCode, updateZipCode, isInitialized]);

  useEffect(() => {
    const fetchAnimals = async () => {
      console.log('ResultsClient: Starting fetchAnimals', {
        zipCode,
        isInitialized,
        loading
      });

      if (!isInitialized) {
        console.log('ResultsClient: Context not initialized yet');
        return;
      }

      if (!zipCode?.trim()) {
        console.log('ResultsClient: No zip code provided');
        setError('Please provide a zip code');
        setLoading(false);
        return;
      }

      try {
        console.log('ResultsClient: Fetching animals for zip code:', zipCode);
        const response = await fetch(`/api/search?zipCode=${zipCode}`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('ResultsClient: API error:', data);
          throw new Error(data.error || 'Failed to fetch animals');
        }
        
        console.log('ResultsClient: Successfully fetched animals:', data.animals?.length);
        setAnimals(data.animals || []);
        setError(null);
      } catch (err) {
        console.error('ResultsClient: Error fetching animals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, [zipCode, isInitialized]);

  if (!isInitialized || loading) {
    console.log('ResultsClient: Showing loading state', { isInitialized, loading });
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    console.log('ResultsClient: Showing error state:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!animals.length) {
    console.log('ResultsClient: No animals found for zip code:', zipCode);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">No Pets Found</p>
          <p className="text-gray-600">We couldn't find any pets near {zipCode}. Try searching in a different area.</p>
        </div>
      </div>
    );
  }

  console.log('ResultsClient: Rendering animals list:', animals.length);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {animals.map((animal) => (
        <div key={animal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {animal.photos?.[0]?.medium && (
            <div className="relative h-48">
              <Image
                src={animal.photos[0].medium}
                alt={animal.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold">{animal.name}</h3>
            <p className="text-gray-600">{animal.breeds.primary}</p>
            <p className="text-sm text-gray-500 mt-2">
              {animal.age} • {animal.gender} • {animal.size}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
