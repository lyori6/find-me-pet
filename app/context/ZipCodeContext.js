'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ZipCodeContext = createContext();

export function ZipCodeProvider({ children }) {
  console.log('ZipCodeProvider: Initializing');
  const searchParams = useSearchParams();
  const [zipCode, setZipCode] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize zip code from URL params or localStorage
    const urlZipCode = searchParams?.get('zipCode');
    const storedZipCode = typeof window !== 'undefined' ? localStorage.getItem('searchZipCode') : null;
    
    console.log('ZipCodeProvider: Initial state', {
      urlZipCode,
      storedZipCode,
      currentZipCode: zipCode,
      isInitialized
    });

    const initialZipCode = urlZipCode || storedZipCode || null;
    console.log('ZipCodeProvider: Setting initial zip code:', initialZipCode);
    
    setZipCode(initialZipCode);
    setIsInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    // Only sync with localStorage after initialization and when zipCode changes
    if (isInitialized && typeof window !== 'undefined') {
      console.log('ZipCodeProvider: Syncing with localStorage:', {
        zipCode,
        isInitialized
      });
      
      if (zipCode) {
        localStorage.setItem('searchZipCode', zipCode);
      } else {
        localStorage.removeItem('searchZipCode');
      }
    }
  }, [zipCode, isInitialized]);

  const updateZipCode = (newZipCode) => {
    console.log('ZipCodeProvider: Updating zip code:', {
      current: zipCode,
      new: newZipCode
    });
    setZipCode(newZipCode);
  };

  const contextValue = {
    zipCode,
    updateZipCode,
    isInitialized
  };

  console.log('ZipCodeProvider: Rendering with context:', contextValue);

  return (
    <ZipCodeContext.Provider value={contextValue}>
      {children}
    </ZipCodeContext.Provider>
  );
}

export function useZipCode() {
  const context = useContext(ZipCodeContext);
  if (context === undefined) {
    console.error('useZipCode: Hook called outside of provider!');
    throw new Error('useZipCode must be used within a ZipCodeProvider');
  }
  return context;
}
