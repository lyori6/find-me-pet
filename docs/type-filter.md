
	1.	API Call Filtering – The API will only request animals that match the user’s selection in Step 5.
	2.	Results Page Logic – The UI will display filter tags only for the selected categories.
	3.	Default Behavior – If the user selects all three options (Dogs, Cats, Rabbits), the system will treat it as “any,” and all animals will be shown.

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