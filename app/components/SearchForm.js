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
      saveSelectedPetTypes(selectedPetTypes);
      setCurrentStep(2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateZipCode(zipCode)) {
      saveZipCode(zipCode);
      const petTypesParam = selectedPetTypes.length === 3 ? 'any' : selectedPetTypes.join(',');
      router.push(`/results?zipCode=${encodeURIComponent(zipCode)}&petTypes=${encodeURIComponent(petTypesParam)}`);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {currentStep === 1 ? (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">What type of pet are you looking for?</h2>
            <p className="text-sm text-muted-foreground">Select one or more options. Choosing all is the same as no preference.</p>
          </div>
          
          <div className="space-y-3">
            {['Dogs', 'Cats', 'Rabbits'].map((type) => (
              <label key={type} className="flex items-center p-4 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPetTypes.includes(type.toLowerCase())}
                  onChange={() => handlePetTypeChange(type.toLowerCase())}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-3 text-base">{type}</span>
              </label>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleNext}
            disabled={selectedPetTypes.length === 0}
            className="w-full mt-6"
          >
            Next
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-foreground mb-1">
              Enter your zip code
            </label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => {
                setZipCode(e.target.value);
                setError(null);
              }}
              placeholder="Enter 5-digit zip code"
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={5}
            />
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading || locationLoading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Find Pets'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={detectLocation}
              disabled={loading || locationLoading}
              className="flex-1"
            >
              {locationLoading ? <LoadingSpinner size="small" /> : 'Use My Location'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
