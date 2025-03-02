'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getZipCode } from '@/app/utils/storage';
import { Search } from 'lucide-react';

export default function QuickSearchButton({ className = '' }) {
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
      variant="outline"
      className={`w-full sm:w-auto text-base font-medium py-5 px-8 border-2 border-slate-300 text-slate-700 rounded-full hover:bg-slate-100 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap ${className}`}
      onClick={handleQuickSearch}
      disabled={loading}
    >
      <Search className="w-4 h-4" />
      {loading ? "Loading..." : "Quick Search"}
    </Button>
  );
}
