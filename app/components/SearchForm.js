'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveZipCode, validateZipCode, saveSelectedPetTypes, getSelectedPetTypes } from '../utils/storage';
import { Button } from '@/components/ui/button';
import LoadingSpinner from './LoadingSpinner';

export default function SearchForm() {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPetTypes, setSelectedPetTypes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const savedPetTypes = getSelectedPetTypes();
    if (savedPetTypes) {
      setSelectedPetTypes(savedPetTypes);
    }
  }, []);

  const handlePetTypeChange = (type) => {
    setSelectedPetTypes(prev => {
      const newSelection = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      return newSelection;
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedPetTypes.length > 0) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateZipCode(zipCode)) {
      saveZipCode(zipCode);
      
      // Build the URL with proper parameters
      let url = `/results?zipCode=${encodeURIComponent(zipCode)}`;
      
      // Only add petTypes if specific types are selected (not all)
      if (selectedPetTypes.length > 0 && selectedPetTypes.length < 3) {
        url += `&petTypes=${encodeURIComponent(selectedPetTypes.join(','))}`;
      }
      
      // Save to localStorage
      saveSelectedPetTypes(selectedPetTypes);
      router.push(url);
    } else {
      setError('Please enter a valid 5-digit zip code.');
    }
  };

  const detectLocation = async () => {
    setLocationLoading(true);
    setError(null);
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Use OpenStreetMap's Nominatim API to get zip code from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get location information');
      }
      
      const data = await response.json();
      const detectedZipCode = data.address.postcode;
      
      if (detectedZipCode && validateZipCode(detectedZipCode)) {
        setZipCode(detectedZipCode);
        saveZipCode(detectedZipCode);
      } else {
        throw new Error('Could not determine a valid zip code from your location');
      }
    } catch (err) {
      setError(err.message || 'Failed to detect your location');
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
      {currentStep === 1 && (
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-6">What type of pet are you looking for?</h2>
          <div className="space-y-4">
            {['Dogs', 'Cats', 'Rabbits'].map((type) => (
              <Button
                key={type}
                onClick={() => handlePetTypeChange(type)}
                variant={selectedPetTypes.includes(type) ? "default" : "outline"}
                className="w-full py-6 text-lg"
              >
                {type} {selectedPetTypes.includes(type) && '✓'}
              </Button>
            ))}
          </div>
          <Button 
            onClick={handleNext} 
            disabled={selectedPetTypes.length === 0}
            className="w-full mt-6 py-6 text-lg"
          >
            Next
          </Button>
        </div>
      )}
      
      {currentStep === 2 && (
        <div className="text-center w-full">
          <h2 className="text-2xl font-bold mb-6">Enter your zip code</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter zip code"
              className="text-center text-xl py-6"
              maxLength={5}
            />
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full py-6 text-lg">
              Find Pets
            </Button>
          </form>
        </div>
      )}
    </div>

    {/* Bottom navigation - only show if not on step 1 */}
    {currentStep !== 1 && (
      <div className="mt-auto py-4 px-4 w-full">
        <div className="max-w-md mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="w-full py-4"
          >
            Back
          </Button>
        </div>
      </div>
    )}
  );
}
