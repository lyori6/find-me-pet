/**
 * Centralized caching utility for the FindMePet application
 * Handles caching of pet search results, individual pet details, and AI recommendations
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const AI_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for AI recommendations

// Helper function to consistently normalize pet types
const normalizePetTypes = (types) => {
  if (!types || !Array.isArray(types) || types.length === 0) {
    return [];
  }
  
  return types.map(type => {
    if (!type) return '';
    type = String(type).toLowerCase().trim();
    // Handle singular/plural forms
    if (type === 'dogs') return 'dog';
    if (type === 'cats') return 'cat';
    if (type === 'rabbits') return 'rabbit';
    return type;
  }).filter(Boolean); // Remove any empty strings
};

// Helper function to create search results cache key
const getSearchResultsKey = (zipCode, petTypes) => {
  // Normalize the pet types for consistent keys
  const normalizedTypes = normalizePetTypes(petTypes);
  const typesKey = normalizedTypes.sort().join('-');
  return `search_${zipCode}_${typesKey}`;
};

// Helper function to consistently create cache keys for AI recommendations
const getAiRecommendationKey = (zipCode, petTypes) => {
  // Normalize the pet types for consistent keys
  const normalizedTypes = normalizePetTypes(petTypes);
  const typesKey = normalizedTypes.sort().join('-');
  return `ai_rec_${zipCode}_${typesKey}`;
};

// Helper function to create pet details cache key
const getPetDetailsKey = (petId) => {
  return `pet_details_${petId}`;
};

// Centralized cache for pets data
export const petsCache = {
  // Store search results
  setSearchResults(zipCode, petTypes, data) {
    const key = getSearchResultsKey(zipCode, petTypes);
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    console.log(`Cached search results for ${zipCode} with types: ${petTypes.join(',')}`);
  },

  // Get search results
  getSearchResults(zipCode, petTypes) {
    const key = getSearchResultsKey(zipCode, petTypes);
    const cached = sessionStorage.getItem(key);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log(`Using cached search results for ${zipCode} with types: ${petTypes.join(',')}`);
          return data;
        } else {
          console.log(`Cache expired for search results (${zipCode})`);
        }
      } catch (e) {
        // Handle parse errors by removing invalid cache
        console.error('Error parsing cached search results:', e);
        sessionStorage.removeItem(key);
      }
    }
    return null;
  },

  // Store individual pet details
  setPetDetails(petId, data) {
    const key = getPetDetailsKey(petId);
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    console.log(`Cached pet details for ID: ${petId}`);
  },

  // Get individual pet details
  getPetDetails(petId) {
    const key = getPetDetailsKey(petId);
    const cached = sessionStorage.getItem(key);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log(`Using cached pet details for ID: ${petId}`);
          return data;
        } else {
          console.log(`Cache expired for pet details (${petId})`);
        }
      } catch (e) {
        // Handle parse errors by removing invalid cache
        console.error('Error parsing cached pet details:', e);
        sessionStorage.removeItem(key);
      }
    }
    return null;
  },

  // Store AI recommendation
  setAiRecommendation(zipCode, petTypes, data) {
    const key = getAiRecommendationKey(zipCode, petTypes);
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    console.log(`Cached AI recommendation for ${zipCode} with types: ${petTypes.join(',')}`);
  },

  // Get AI recommendation
  getAiRecommendation(zipCode, petTypes) {
    const key = getAiRecommendationKey(zipCode, petTypes);
    const cached = localStorage.getItem(key);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // AI recommendations can be valid longer
        if (Date.now() - timestamp < AI_CACHE_DURATION) {
          console.log(`Using cached AI recommendation for ${zipCode} with types: ${petTypes.join(',')}`);
          return data;
        } else {
          console.log(`Cache expired for AI recommendation (${zipCode})`);
        }
      } catch (e) {
        console.error('Error parsing cached AI recommendation:', e);
        localStorage.removeItem(key);
      }
    }
    return null;
  },

  // Clear all caches
  clearAll() {
    // Clear only application's cache keys, not all sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('search_') || key.startsWith('pet_details_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ai_rec_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All pet caches cleared');
  },
  
  // Clear specific cache types
  clearSearchResults() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('search_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('Search results cache cleared');
  },
  
  clearPetDetails() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('pet_details_')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('Pet details cache cleared');
  },
  
  clearAiRecommendations() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ai_rec_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('AI recommendations cache cleared');
  }
};
