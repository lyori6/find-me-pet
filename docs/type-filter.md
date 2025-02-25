# Pet Type Filter Implementation

## Overview
The pet type filter system allows users to filter their pet search results by animal type (Dogs, Cats, Rabbits). Currently, the filters are locked (disabled) on the results page due to ongoing implementation issues that need to be resolved.

## Current Status
The type filter is currently implemented with the following features:

1. Multiple Type Selection
   - Users can select multiple pet types (e.g., Dogs and Cats)
   - Each type combination triggers parallel API calls to ensure complete results
   - Results are automatically combined, deduplicated, and sorted by distance

2. Loading States
   - A loading spinner is shown during API calls
   - Smooth transitions between loading, error, and results states
   - Animated feedback keeps users informed of request progress

3. Filter Locking
   - Filters are currently locked after initial selection
   - This is intentional to prevent race conditions during API calls
   - Users must refresh or return to home to change filters

## Known Issues and Limitations

1. Filter Changes
   - Filters cannot be changed on the results page
   - This is a temporary limitation while we improve the filter handling
   - Users should return to the home page to modify their search

2. API Behavior
   - Multiple type selections require parallel API calls
   - Each type (e.g., Dog, Cat) requires a separate request
   - Results are combined client-side for the best user experience

## Future Improvements

1. Dynamic Filter Updates
   - Enable filter changes without page reload
   - Implement proper state management for filter combinations
   - Add transition animations for filter changes

2. Performance Optimization
   - Implement request batching for multiple types
   - Add progressive loading for large result sets
   - Optimize client-side result combining

3. User Experience
   - Add filter change confirmation dialog
   - Improve error messaging for failed requests
   - Add loading progress indicators for multiple requests

## Technical Implementation

### URL Parameter Handling
```javascript
// Example URL format
/results?zipCode=12345&petTypes=Dog,Cat

// URL construction in SearchForm
if (selectedPetTypes.length > 0) {
  url += `&petTypes=${encodeURIComponent(selectedPetTypes.join(','))}`;
}
```

### Caching Implementation
- Results are cached in sessionStorage for 5 minutes
- Cache is keyed by zipCode and selected pet types
- Cached results are used when navigating back from pet details
- Fresh data is fetched when cache expires or parameters change

### Filter State Management
- Initial state is set from URL parameters
- Filters are locked on results page until issues are resolved
- Users must return to search form to change filters
- State is maintained using React useState hooks

## User Experience
- Clear visual hierarchy with prominent type selection buttons
- Immediate feedback on selection
- Smooth transitions between steps
- Consistent button styling and behavior
- Simplified navigation with single "Next" button
- Locked filters prevent confusion from mid-search changes
- Users must start new search to change filters

## Edge Cases
- Handles plural/singular type names (e.g., "Dogs" vs "Dog")
- Manages case sensitivity in type names
- Gracefully handles empty selections
- Preserves filter state during page refreshes
- Properly syncs URL parameters with visual state

## Future Considerations
- Consider adding filter analytics
- Potential for additional filter categories
- Enhanced filter persistence strategies
- Improved user feedback about locked state

## Implementation Details

The current implementation:
1. Splits multiple types into separate API calls
2. Makes parallel requests for each type
3. Combines and deduplicates results
4. Sorts by distance
5. Shows loading animation during requests
6. Caches results for 5 minutes

For developers:
- Check `ResultsClient.js` for the main implementation
- See `search/route.js` for the API handling
- Loading states use Framer Motion for animations

Updated AI Integration API Specification

New Feature: API Call Filtering Based on Step 5
	•	The pet selection step (Step 5) determines which animal categories will be sent in the OpenAI API request.
	•	The results page will only show filter tags relevant to the user’s selection.

Integration Steps

Step 1: Capture and Store Pet Preferences
	•	Action: When the user selects pet categories, store their selection.
	•	Implementation:

const selectedPetTypes = JSON.parse(localStorage.getItem("selectedPetTypes")) || [];


	•	Logic:
	•	If all three options are selected, set preferredPetType = "any".
	•	Otherwise, store only the selected categories.

Step 2: Adjust the API Call
	•	The API should only request the selected animals.
	•	If preferredPetType is "any", send all available animals.
	•	If one or two animals are selected, filter the request accordingly.

Updated API Request

fetch("/api/getAiRecommendation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    preferredPetType,  // "dog", "cat", "rabbit", or ["dog", "cat"]
    userInput,         // includes zip code
    filteredAnimals
  })
});

Example API Payload

{
  "preferredPetType": ["dog", "rabbit"],
  "userInput": {
    "zipCode": "12345"
  },
  "filteredAnimals": [
    { "id": 123, "type": "dog", "breed": "Labrador" },
    { "id": 456, "type": "rabbit", "breed": "Holland Lop" }
  ]
}

Step 3: Results Page Filter Logic
	•	Only show filter tags for the categories the user selected.
	•	If "any", display the full results page without specific filters.

Frontend Implementation

const selectedPetTypes = JSON.parse(localStorage.getItem("selectedPetTypes")) || [];
const showAllAnimals = selectedPetTypes.length === 3 || selectedPetTypes.length === 0;

// Display the appropriate filters
if (showAllAnimals) {
  displayAllFilters();
} else {
  displaySelectedFilters(selectedPetTypes);
}

Step 4: Prompt for OpenAI API

New Prompt

The user is searching for a pet in zip code {zipCode}.
They are only interested in: {preferredPetType}.
Available animals matching their preference:
{filteredAnimals}

Please provide a recommendation based only on these animals.

Step 5: Update Backend Logic
	•	The backend must filter filteredAnimals before sending the request.
	•	If preferredPetType is "any", pass all animals.
	•	Otherwise, match only the selected categories.

Updated Backend Code

const { preferredPetType, userInput, allAnimals } = req.body;

// Filter animals based on selection
const filteredAnimals = (preferredPetType === "any")
  ? allAnimals
  : allAnimals.filter(animal => preferredPetType.includes(animal.type));

const completion = await openai.createCompletion({
  model: "gpt-3.5-turbo",
  prompt: generatePrompt(userInput, preferredPetType, filteredAnimals),
  max_tokens: 150,
  temperature: 0.7
});

Final Behavior

User Selection	API Call	UI Behavior
Dog & Cat	Only Dogs & Cats	Show “Dog” & “Cat” filter tags
Only Rabbits	Only Rabbits	Show “Rabbit” filter tag
All (or nothing selected)	All Animals	Show all filter tags

Summary
	•	The system only sends the selected animals in the API request.
	•	The results page only displays relevant filters.
	•	OpenAI receives a refined prompt with only the user’s selected categories.

This ensures a precise, user-specific experience without unnecessary data processing. 🚀