'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getZipCode } from '@/app/utils/storage';

export default function QuickSearchButton() {
  const [loading, setLoading] = useState(false);
  
  const handleQuickSearch = () => {
    setLoading(true);
    
    // Get the stored zip code if available
    const zipCode = getZipCode();
    
    if (zipCode) {
      // If we already have a zip code, go directly to the alt-results page
      window.location.href = `/alt-results?zipCode=${encodeURIComponent(zipCode)}`;
    } else {
      // If no zip code is stored, go to the zip code page
      window.location.href = '/search';
    }
  };
  
  return (
    <Button 
      size="lg" 
      variant="outline"
      className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all hover:scale-105 w-full sm:w-auto"
      onClick={handleQuickSearch}
      disabled={loading}
    >
      {loading ? "Loading..." : "Quick Search"}
    </Button>
  );
}
