'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveZipCode, getZipCode } from '../utils/storage';

export default function QuickSearch() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleQuickSearch = () => {
    setLoading(true);
    
    // Get the stored zip code if available
    const zipCode = getZipCode();
    
    if (zipCode) {
      // Using alt-results as a completely different route path
      window.location.href = `/alt-results?zipCode=${encodeURIComponent(zipCode)}`;
    } else {
      // If no zip code is stored, go to the zip code page
      window.location.href = '/search';
    }
  };
  
  return (
    <button
      onClick={handleQuickSearch}
      className="bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 text-white px-4 py-2 rounded-md font-medium transition-all duration-200"
      disabled={loading}
    >
      {loading ? "Loading..." : "Quick Search"}
    </button>
  );
}
