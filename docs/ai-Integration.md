Below is the updated version of your ai-Integration.md document with the new multi-choice step added. Notice the added section “New Step: Pet Type Preference” before the Zip Code step. This new form page lets users choose checkboxes for “Dogs,” “Cats,” and “Rabbits” (or, if they select all three, it defaults to “any animal”). Also, this page will not auto-progress; the user must click “Next” to continue.

# AI Integration API Specification

## Overview
This document details the integration of AI-powered recommendations into the pet finder results page. The goal is to asynchronously generate a personalized recommendation—based on user input and filtered animal data—using the OpenAI API. The generated recommendation is cached in local storage to improve performance and user experience.

## Architecture
- **Frontend**: Renders search results, pet preferences, and an AI recommendation area.
- **Local Storage**: Caches the AI-generated recommendation for subsequent visits.
- **Backend (Vercel Endpoint)**: Aggregates user preferences and animal data, constructs a prompt, and calls the OpenAI API.
- **OpenAI API**: Generates a text completion (recommendation) based on the provided prompt.

## Prerequisites
- An OpenAI API account and API key.
- A Vercel deployment for the custom backend endpoint.
- Frontend application with local storage support.

## User Flow Overview
1. **Pet Type Preference Step (New)** – The user selects one or more pet types (Dogs, Cats, Rabbits).  
   - **Logic**:  
     - If one or two options are selected, filter results accordingly.
     - If all three are selected, treat it as "agnostic" (i.e. no filter).
   - **UI Note**: This page is the last step before entering the zip code and does not auto-progress. The user must click a "Next" button.
2. **Zip Code and Additional Input** – The user provides their zip code and any other necessary data.
3. **Search Results** – Animal listings are displayed (filtered based on the pet type selection if applicable).
4. **AI Recommendation Fetch** – In the background, the AI recommendation is generated and displayed.

## API Endpoints

### AI Recommendation Endpoint
- **URL**: `/api/getAiRecommendation`
- **Method**: POST
- **Description**: Receives user preferences, input data, and filtered animal listings, then returns a personalized recommendation.

#### Request Payload
```json
{
  "preferredPetType": "dog",          // e.g., "dog", "cat", "rabbit", or "any" (if agnostic)
  "userInput": {
    "zipCode": "12345",
    "otherData": "..."
  },
  "filteredAnimals": [
    {
      "id": 123,
      "type": "dog",
      "breed": "Labrador"
      // additional properties...
    }
    // ...more animal objects
  ]
}

Response Payload

{
  "recommendation": "Based on your preferences, we recommend checking out these companions: ...",
  "metadata": {
    "generatedAt": "2025-02-24T20:00:00Z"
  }
}

Error Response

{
  "error": "Unable to generate recommendation. Please try again later."
}

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
