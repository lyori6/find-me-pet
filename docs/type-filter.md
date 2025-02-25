# Pet Type Filter Implementation

## Overview
The pet type filter system allows users to filter their pet search results by animal type (Dogs, Cats, Rabbits). The implementation includes initial selection during search and displays the selected filters on the results page.

## Key Features

### Search Form (Step 1 of 2)
- Users can select one or more pet types (Dogs, Cats, Rabbits)
- Clear visual feedback with checkmark indicators for selected types
- Single "Next" button positioned below the type selection
- Selection state persists in localStorage
- Selecting all types shows all available pets
- Initial selection is final and cannot be changed on results page

### Results Page
- Filter buttons show current selection state
- Filters are always locked to prevent state changes
- Locked filters are visually distinct (reduced opacity, disabled state)
- Filter state persists across page refreshes
- URL parameters reflect filter state

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

### Filter State Management
- Initial state is set from URL parameters
- Filters are always locked on results page
- Users must return to search form to change filters
- State is maintained using React useState hooks

### API Integration
- Pet type parameters are properly formatted for Petfinder API
- Multiple type selections use separate type parameters
- Empty selection shows all available pets

### LocalStorage Integration
```javascript
// Structure for stored preferences
{
  "selectedPetTypes": ["Dog", "Cat"] // or [] for all pets
}
```

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