'use client';

import { useRouter } from 'next/navigation';
import { updatePetDataField } from '../utils/petDataStorage';
import { useState } from 'react';

const LocationStep = () => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleLocationFound = async (zipCode) => {
    try {
      // First update storage
      await updatePetDataField('zipCode', zipCode);
      
      // Force a small delay to ensure storage completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use direct navigation instead of router.push
      window.location.href = `/results?zipCode=${encodeURIComponent(zipCode)}`;
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Failed to save your location. Please try again.');
    }
  };

  return (
    <div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {/* Render your component content here */}
    </div>
  );
};

export default LocationStep; 