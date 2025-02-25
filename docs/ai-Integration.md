Below is the updated version of your ai-Integration.md document with the new multi-choice step added. Notice the added section “New Step: Pet Type Preference” before the Zip Code step. This new form page lets users choose checkboxes for “Dogs,” “Cats,” and “Rabbits” (or, if they select all three, it defaults to “any animal”). Also, this page will not auto-progress; the user must click “Next” to continue.

# AI Integration API Specification

## Overview
This document details the integration of AI-powered recommendations into the pet finder results page, including the pet type filtering system. The goal is to provide personalized recommendations based on user preferences and filtered animal data.

## Architecture
- **Frontend**: Renders search form, results page with locked filters, and AI recommendations
- **Local Storage**: Caches user preferences and AI recommendations
- **Backend**: Handles Petfinder API requests and AI recommendation generation
- **Petfinder API**: Provides filtered animal data based on user preferences

## User Flow

### 1. Pet Type Selection (Step 1)
- Users select pet types (Dogs, Cats, Rabbits)
- Interface provides clear visual feedback
- Single "Next" button for progression
- Selection is final and determines results page filters
- Empty selection shows all available pets

### 2. Location Input (Step 2)
- Users enter zip code
- Validates input format
- Stores location preference

### 3. Results Page
- Displays filtered pet results based on initial selection
- Shows locked filter buttons reflecting selection
- Generates AI recommendations based on:
  - Selected pet types (or all types if none selected)
  - Location
  - Available animals

## API Endpoints

### Search Endpoint
```javascript
GET /api/search
Parameters:
- zipCode: string (required)
- petTypes: string (optional, comma-separated)
- status: string (default: 'adoptable')

Example: /api/search?zipCode=12345&petTypes=Dog,Cat&status=adoptable
```

### AI Recommendation Endpoint
```javascript
POST /api/getAiRecommendation
Request Body: {
  selectedTypes: string[],  // Empty array means all types
  zipCode: string,
  filteredAnimals: Animal[]
}
```

## Data Structures

### Pet Type Selection
```javascript
interface PetTypeState {
  selectedTypes: string[];  // Empty array means all types
}

// LocalStorage format
{
  "selectedPetTypes": string[],
  "zipCode": string
}
```

### Filter State Management
```javascript
interface FilterState {
  types: string[];
  initialSelection: string[];
}
```

## Implementation Details

### Filter Display Logic
```javascript
const renderFilterButtons = () => {
  return allTypes.map(type => (
    <Button
      key={type}
      disabled={true}
      variant={selectedTypes.includes(type) ? 'default' : 'outline'}
      className="cursor-not-allowed opacity-70"
    >
      {type}s {selectedTypes.includes(type) && '✓'}
    </Button>
  ));
};
```

### API Request Formation
```javascript
const buildApiUrl = (zipCode, types) => {
  let url = `/api/search?zipCode=${zipCode}&status=adoptable`;
  if (types.length > 0) {
    url += `&petTypes=${types.join(',')}`;
  }
  return url;
};
```

## Error Handling
- Validates zip code format
- Handles API request failures
- Manages token expiration
- Provides fallback recommendations

## Future Enhancements
- Enhanced filter analytics
- Additional filter categories
- Improved AI recommendations based on filter usage
- Filter preference learning
- Better visual feedback for locked state

## Pet Type Selection

The pet finder form now includes a pet type selection step that allows users to filter their search by animal type. This feature implements the following logic:

### Selection Logic
- Users can select one or more pet types (Dogs, Cats, Rabbits)
- If all three types are selected, the system treats it as "any" preference
- Selections are stored in localStorage under `selectedPetTypes` as an array
- The selection step requires explicit user confirmation via a "Next" button before proceeding

### Implementation Details
- Multi-choice selection using checkboxes with modern iOS-style design
- Manual progression required to ensure intentional selection
- LocalStorage integration for persistent preferences
- Automatic conversion to "any" when all types are selected
- URL parameter handling for search results filtering

### User Experience
- Clear instructions inform users about multi-selection capability
- Visual feedback through checkbox states
- Smooth transition between selection and zip code steps
- Consistent styling with iOS-like interface elements

Integration Steps

New Step: Pet Type Preference
	•	Purpose: Allow the user to choose their desired pet types.
	•	UI: Provide multi-select checkboxes for:
	•	Dogs
	•	Cats
	•	Rabbits
	•	Logic:
	•	If the user selects one or two options, use those selections to filter the animal listings.
	•	If the user selects all three options (i.e. Dogs, Cats, and Rabbits), treat it as “any animal” (agnostic filter).
	•	Navigation: This page is the final step before the zip code input and requires the user to click the “Next” button (no auto-progression).

Step 1: Capture Pet Type Preference
	•	Action: On the new pet type page, let the user check the boxes.
	•	Implementation: Save the selection in local storage.

// Example: Save the selected pet types (array of strings)
localStorage.setItem("selectedPetTypes", JSON.stringify(selectedPetTypes));


	•	Filtering Logic:

const selectedPetTypes = JSON.parse(localStorage.getItem("selectedPetTypes")) || [];
// If all three options are selected, treat as "any"
const preferredPetType = (selectedPetTypes.length === 3) ? "any" : selectedPetTypes;



Step 2: Capture Zip Code and Additional User Input
	•	Action: Ask the user for their zip code and any other necessary data.
	•	Implementation: Store this input in local storage.

Step 3: Filter Animal Data on Results Page
	•	Action: Retrieve the stored pet type preference and zip code.

const preferredPetType = localStorage.getItem("selectedPetTypes")
  ? (JSON.parse(localStorage.getItem("selectedPetTypes")).length === 3 ? "any" : JSON.parse(localStorage.getItem("selectedPetTypes")))
  : "any";


	•	Filtering: Use the retrieved preference to filter the animal listings from your search API.

Step 4: Manage Recommendation Caching
	•	Check: Look for an existing AI recommendation in local storage.

const cachedRecommendation = localStorage.getItem("aiRecommendation");


	•	Clear: Remove the cached recommendation when the user updates their pet type preference or starts a new search.

localStorage.removeItem("aiRecommendation");



Step 5: Trigger AI Recommendation Fetch
	•	UI Behavior: Immediately display search results along with a loading message like, “The AI is figuring out your best companion…”
	•	Fetch Process: If no cached recommendation exists, send a POST request to your backend endpoint.

fetch("/api/getAiRecommendation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    preferredPetType,
    userInput,         // includes zip code and other input
    filteredAnimals
  })
})
.then(response => response.json())
.then(data => {
  localStorage.setItem("aiRecommendation", data.recommendation);
  displayRecommendation(data.recommendation);
})
.catch(error => displayError("Unable to load AI recommendation."));



Step 6: Backend AI Recommendation Generation
	•	Prompt Construction: The backend constructs a prompt that includes the pet type preference (or “any” if agnostic), user input, and filtered animal data. Example:

"User prefers a dog. Input: {zipCode: '12345', ...}. Available animals: [{id:123, type:'dog', breed:'Labrador'}, ...]. Please recommend the best companion."


	•	OpenAI API Call: Use the OpenAI API (model gpt-3.5-turbo) to generate a recommendation.

const completion = await openai.createCompletion({
  model: "gpt-3.5-turbo",
  prompt: prompt,
  max_tokens: 150,
  temperature: 0.7
});
const recommendationText = completion.data.choices[0].text.trim();


	•	Return: Send the generated text back to the frontend.

Step 7: Display Recommendation and Update Cache
	•	Display: Update the recommendation area in the UI once the response is received.
	•	Cache: Store the new recommendation in local storage until the user’s inputs change.

OpenAI API Parameters & Considerations
	•	Model: Use gpt-3.5-turbo for a balance of cost and performance.
	•	Max Tokens: Limit to around 150 tokens for concise recommendations.
	•	Temperature: Set to ~0.7 to allow creative yet focused outputs.
	•	Error Handling: Ensure graceful degradation if the OpenAI API fails or returns an error.

Security & Best Practices
	•	API Key Security: Keep your OpenAI API key secure on the backend (Vercel environment variables) and never expose it to the frontend.
	•	Local Storage: Cache only non-sensitive, non-personal data.
	•	Rate Limiting & Retries: Implement proper error handling and retry logic for API calls.
	•	Prompt Engineering: Regularly refine your prompt to ensure recommendations align with your brand’s tone and requirements.

References
	•	OpenAI API Reference  ￼
	•	Developer Quickstart for OpenAI API  ￼
	•	Comprehensive Guide to OpenAI API Integration for AI Applications  ￼
