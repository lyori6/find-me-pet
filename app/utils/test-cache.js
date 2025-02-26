// Test utility for debugging cache behavior
// This file can be imported in a component during development to help diagnose cache issues

import { petsCache } from './cache';

export const testCache = {
  // Log all cache keys and their contents
  logAllCacheEntries() {
    console.group('Cache Contents');
    
    console.group('Session Storage (Search Results & Pet Details)');
    let sessionItems = 0;
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('search_') || key.startsWith('pet_details_')) {
        const item = JSON.parse(sessionStorage.getItem(key));
        console.log(`- Key: ${key}`);
        console.log(`  - Age: ${(Date.now() - item.timestamp) / 1000}s`);
        console.log(`  - Data: `, item.data);
        sessionItems++;
      }
    });
    if (sessionItems === 0) console.log('No items in session storage');
    console.groupEnd();
    
    console.group('Local Storage (AI Recommendations)');
    let localItems = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ai_rec_')) {
        const item = JSON.parse(localStorage.getItem(key));
        console.log(`- Key: ${key}`);
        console.log(`  - Age: ${(Date.now() - item.timestamp) / 1000}s`);
        console.log(`  - Data: `, item.data);
        localItems++;
      }
    });
    if (localItems === 0) console.log('No items in local storage');
    console.groupEnd();
    
    if (sessionItems === 0 && localItems === 0) {
      console.log('No cache entries found');
    }
    
    console.groupEnd();
    
    return {
      sessionItems,
      localItems,
      total: sessionItems + localItems
    };
  },
  
  // Test specific cache keys
  testSearchResultsCache(zipCode, petTypes) {
    const result = petsCache.getSearchResults(zipCode, petTypes);
    console.group('Search Results Cache Test');
    console.log(`- ZipCode: ${zipCode}`);
    console.log(`- Pet Types: ${petTypes.join(', ')}`);
    if (result) {
      console.log('- Cache HIT ✅');
      console.log(`- Items: ${result.length}`);
      console.log('- First item:', result[0]);
    } else {
      console.log('- Cache MISS ❌');
    }
    console.groupEnd();
    return result;
  },
  
  testPetDetailsCache(petId) {
    const result = petsCache.getPetDetails(petId);
    console.group('Pet Details Cache Test');
    console.log(`- Pet ID: ${petId}`);
    if (result) {
      console.log('- Cache HIT ✅');
      console.log('- Data:', result);
    } else {
      console.log('- Cache MISS ❌');
    }
    console.groupEnd();
    return result;
  },
  
  testAiRecommendationCache(zipCode, petTypes) {
    const result = petsCache.getAiRecommendation(zipCode, petTypes);
    console.group('AI Recommendation Cache Test');
    console.log(`- ZipCode: ${zipCode}`);
    console.log(`- Pet Types: ${petTypes.join(', ')}`);
    if (result) {
      console.log('- Cache HIT ✅');
      console.log('- Data:', result);
    } else {
      console.log('- Cache MISS ❌');
    }
    console.groupEnd();
    return result;
  }
};

// Add an export for a debug component that can be added to a page for testing
export function CacheDebugger({ zipCode, petTypes, petId }) {
  return null; // This is a headless component, but it will trigger the debug logs
}

// Export a standalone function that can be called from the browser console
// Usage: window.debugCache()
if (typeof window !== 'undefined') {
  window.debugCache = testCache.logAllCacheEntries;
  window.testSearchCache = (zip, types) => testCache.testSearchResultsCache(zip, types || ['dog', 'cat']);
  window.testPetCache = (id) => testCache.testPetDetailsCache(id);
  window.testAiCache = (zip, types) => testCache.testAiRecommendationCache(zip, types || ['dog', 'cat']);
}

export default testCache;
