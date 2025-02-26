# AI Recommendation Caching Flow

This document outlines the implementation of the AI recommendation caching flow and image gallery enhancements in the FindMePet application.

## AI Recommendation Caching Flow

### Overview

The AI recommendation feature provides personalized pet suggestions based on user preferences. To optimize performance and user experience, we've implemented a caching mechanism with specific rules for when to fetch new data versus using cached data.

### Implementation Details

#### Caching Approach

- **Storage Mechanism**: AI recommendation data is cached in the browser's `localStorage` using the following keys:
  - `aiRecommendation`: Stores the actual recommendation data
  - `aiSearchParams`: Stores the search parameters used to generate the recommendation

#### When Data is Refreshed

1. **Coming from Questionnaire Flow**:
   - When a user completes the questionnaire and arrives at the results page, any existing AI recommendation is cleared from `localStorage`
   - A fresh API call is triggered to fetch the latest AI recommendation based on the new criteria
   - This is detected using a `comingFromQuestionnaire` flag in `sessionStorage`

2. **Navigating Around the Application**:
   - When a user navigates to a pet's detail page (or elsewhere) and then returns to the recommendation view, the cached AI data is retrieved from `localStorage`
   - This ensures the user sees the same results as before without unnecessary API calls

#### Code Implementation

The main logic for this caching flow is implemented in the `ai-recommendation.tsx` component:

```tsx
// Check if we're coming from the questionnaire flow
const comingFromFlow = sessionStorage.getItem("comingFromQuestionnaire") === "true";

// If coming from questionnaire flow, clear existing AI match from local storage
if (comingFromFlow) {
  localStorage.removeItem("aiRecommendation");
  localStorage.removeItem("aiSearchParams");
  sessionStorage.removeItem("comingFromQuestionnaire");
  
  // Fetch a new recommendation if we have animals
  if (filteredAnimals.length > 0) {
    fetchRecommendation();
  }
  return;
}

// Try to load recommendation from localStorage
const cachedRecommendation = localStorage.getItem("aiRecommendation");
const cachedSearchParams = localStorage.getItem("aiSearchParams");
```

The flag is set in the questionnaire page when the user submits their preferences:

```tsx
// Set flag to indicate we're coming from the questionnaire flow
sessionStorage.setItem("comingFromQuestionnaire", "true")
```

## Image Gallery & Usability Enhancements

### Close Button Improvements

- The close (X) icon has been made more prominent and positioned at the top right corner
- Increased size and added better contrast to ensure visibility over both dark and bright images
- Added a contrasting background and border to make it stand out

### Keyboard Interactions

- **Escape Key**: Pressing the Escape key now closes the gallery image modal
- **Arrow Keys**: Pressing the left/right arrow keys navigates to the previous/next image in the gallery
- Implementation uses event listeners that are properly cleaned up when the component unmounts

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (enlargedImage) {
      if (e.key === 'Escape') {
        closeEnlargedImage();
      } else if (e.key === 'ArrowLeft' && totalMediaCount > 1 && !isVideo) {
        // Navigate to previous image
        // ...
      } else if (e.key === 'ArrowRight' && totalMediaCount > 1 && !isVideo) {
        // Navigate to next image
        // ...
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [enlargedImage, activePhotoIndex, totalMediaCount, isVideo, photos]);
```

### Mobile Swiping

- On mobile/touch devices, swiping left/right now navigates through the images
- Improved swipe detection with a lower threshold for better responsiveness
- Touch event handlers are implemented for both the thumbnail view and the enlarged image modal

```javascript
// Enhanced touch event handlers for swipe functionality
const handleTouchStart = (e) => {
  setTouchStart(e.targetTouches[0].clientX);
};

const handleTouchMove = (e) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {
  // Improved threshold for better swipe detection
  const swipeThreshold = 50; // Reduced from 70 to make swiping more responsive
  
  if (touchStart - touchEnd > swipeThreshold) {
    // Swipe left - go to next photo
    nextPhoto();
  }
  
  if (touchEnd - touchStart > swipeThreshold) {
    // Swipe right - go to previous photo
    prevPhoto();
  }
};
```

### Modal Positioning

- The modal and its close button remain properly positioned across different devices
- Centered on desktop and appropriately scaled on mobile
- Added helper text for mobile users to indicate how to close the modal

## API Response Configuration

- Increased the `max_tokens` limit from 200 to 500 in the OpenAI API call to allow for more detailed AI recommendations
- This ensures there's enough space in the UI for the full recommendation text
- Updated the prompt handling to use placeholders from the environment variable without revealing the actual prompt structure

```javascript
// Using environment variable with placeholders
let promptTemplate = process.env.OPENAI_PROMPT;

// Replace placeholders with actual values
if (promptTemplate) {
  promptTemplate = promptTemplate
    .replace('{{PET_TYPE}}', petType)
    .replace('{{ZIP_CODE}}', zipCode)
    .replace('{{PET_SAMPLES}}', petSamples.map((pet, index) => `...`).join('\n'));
}
```

## Bug Fixes

### Token Expiration Handling

- Improved error handling for token expiration in the Petfinder API endpoints
- Added proper retry logic with fresh tokens in both the search and pet details API routes
- Enhanced error responses to provide clearer information when token refresh fails

```javascript
// Example of improved token refresh handling
if (response.status === 401) {
  console.log('Token expired, requesting a new one...');
  resetTokenCache();
  token = await getAccessToken(true);
  
  try {
    const retryResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Handle the retry response appropriately
    // ...
  } catch (retryError) {
    // Handle retry errors
  }
}
```

### Pet Type Filtering for AI Recommendations

- Fixed an issue where AI recommendations didn't respect the user's selected pet types
- Implemented proper filtering of pet samples based on selected types before generating recommendations
- Added case-insensitive comparison to ensure pet types match regardless of capitalization
- Included detailed logging to help diagnose any issues with type matching

```javascript
// Filter pet samples by selected types
let filteredPetSamples = petSamples;
if (selectedTypes && selectedTypes.length > 0) {
  // Convert both sides to lowercase for case-insensitive comparison
  filteredPetSamples = petSamples.filter(pet => 
    selectedTypes.some(type => 
      type.toLowerCase() === pet.type.toLowerCase()
    )
  );
  
  // Fallback handling if no pets match the selected types
  if (filteredPetSamples.length === 0) {
    console.warn(`No pets found matching selected types: ${selectedTypes.join(', ')}`);
    filteredPetSamples = petSamples;
  }
}
```

## Debugging Notes

### Image Gallery Touch Events

- Touch events for mobile swiping now properly handle null values to prevent "uninitialized variable" errors
- Added proper initialization of touch state variables with `null` instead of `0` to avoid false positives
- Reset touch values after handling to prevent unexpected behavior on subsequent interactions

```javascript
const [touchStart, setTouchStart] = useState(null);
const [touchEnd, setTouchEnd] = useState(null);

const handleTouchEnd = () => {
  // Check if both touchStart and touchEnd are defined
  if (touchStart === null || touchEnd === null) return;
  
  // Handle swipe logic...
  
  // Reset touch values after handling
  setTouchStart(null);
  setTouchEnd(null);
};
