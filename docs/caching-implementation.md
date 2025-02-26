# FindMePet Caching Implementation

This document outlines the caching strategy implemented in the FindMePet application to optimize performance and reduce unnecessary API calls.

## Overview

The caching system is designed to store and retrieve three types of data:

1. **Pet Search Results**: Results from the PetFinder API when users search for adoptable pets
2. **Individual Pet Details**: Detailed information about specific pets
3. **AI Recommendations**: AI-generated pet recommendations based on user preferences

## Implementation Details

### Centralized Cache Utility

The caching logic is centralized in a single utility file (`app/utils/cache.js`) that provides a consistent API for all caching operations across the application. This approach ensures:

- Consistent caching behavior
- Simplified maintenance
- Clear separation of concerns

### Cache Duration

- **Pet Search Results**: 5 minutes
- **Individual Pet Details**: 5 minutes
- **AI Recommendations**: 30 minutes

These durations balance data freshness with performance optimization.

### Storage Mechanisms

- **sessionStorage**: Used for pet search results and individual pet details
  - Persists during a browser session
  - Cleared when the browser tab is closed
  
- **localStorage**: Used for AI recommendations
  - Persists across browser sessions
  - Provides longer-term storage for recommendations

### Key Structure

Cache keys are structured to ensure uniqueness and proper association with search parameters:

- **Pet Search Results**: `pets-search-${zipCode}-${petTypes.join(',')}`
- **Individual Pet Details**: `pet-details-${petId}`
- **AI Recommendations**: `ai-recommendation-${zipCode}-${petTypes.join(',')}`

### Cache Management

The utility provides methods to:

- Set and get cached data
- Validate cache freshness
- Clear specific cache types or all caches
- Handle cache errors gracefully

## Key Updates (February 2025)

### Type Normalization for Consistent Caching

We've added pet type normalization to ensure consistent cache key generation:

- All pet types are normalized to singular, lowercase format (e.g., "Dogs" → "dog")
- Cache keys are created with consistent helper functions that sort type arrays
- The same normalization is applied in the AI recommendation component and API

These changes ensure that cache hits occur regardless of the order or format of pet types.

### Improved API Response Handling

The AI recommendation API now provides better handling of pet data:

- Clearer pet formatting for the OpenAI model
- Improved response parsing and validation
- Better error messages and fallback handling

### Cache Testing Utilities

Added debugging utilities in `/app/utils/test-cache.js` to help debug cache issues:

- Functions to examine cache contents
- Methods to test specific cache keys
- Browser console helpers for manual testing

Usage example:
```javascript
// In the browser console:
debugCache(); // View all cache entries
testSearchCache('90210', ['dog']); // Test specific search cache
testPetCache('12345'); // Test pet details cache
testAiCache('90210', ['cat']); // Test AI recommendation cache
```

## Usage in Components

### Results Page

The `ResultsClient.js` component uses the cache utility to:
- Check for cached search results before making API calls
- Store new search results in the cache after successful API responses

### Pet Details Page

The `PetDetailsClient.js` component uses the cache utility to:
- Check for cached pet details before making API calls
- Store new pet details in the cache after successful API responses

### AI Recommendation Component

The `ai-recommendation.tsx` component uses the cache utility to:
- Check for cached AI recommendations before making API calls
- Store new AI recommendations in the cache after successful API responses
- Clear cached recommendations when user preferences change

## Benefits

1. **Improved Performance**: Reduces loading times by avoiding redundant API calls
2. **Better User Experience**: Faster navigation between results and pet details pages
3. **Reduced API Usage**: Minimizes external API calls, potentially reducing costs
4. **Consistent Behavior**: Provides a predictable caching experience across the application

## Maintenance

When making changes to the caching system:

1. Update the cache utility first
2. Ensure all components using the cache are updated accordingly
3. Test cache invalidation to ensure data freshness
4. Monitor cache performance in production

## Future Improvements

Potential enhancements to consider:

1. Implement cache versioning to handle API response structure changes
2. Add cache preloading for frequently accessed data
3. Implement more sophisticated cache invalidation strategies
4. Add cache analytics to monitor cache hit/miss rates
