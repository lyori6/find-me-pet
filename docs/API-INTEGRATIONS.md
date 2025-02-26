# API Integrations

## Overview
FindMePet integrates with several external APIs to provide its core functionality. This document details the implementation of these integrations, authentication methods, and usage patterns.

## PetFinder API

### Authentication
The PetFinder API uses OAuth 2.0 for authentication.

#### Token Retrieval
```bash
curl -d "grant_type=client_credentials&client_id={CLIENT-ID}&client_secret={CLIENT-SECRET}" https://api.petfinder.com/v2/oauth2/token
```

#### Response Format
```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "..."
}
```

### Implementation Details

#### Cloudflare Worker Proxy
A Cloudflare Worker is used to proxy requests to the PetFinder API, handling authentication and data retrieval securely.

**Endpoint**: https://petfinder.lyori6ux.workers.dev/

**Usage**: To get a list of adoptable pets by ZIP code, send a GET request with a `zip` query parameter:
```
GET https://petfinder.lyori6ux.workers.dev/?zip=90210
```

#### API Client Implementation
The app uses a custom client to interact with the PetFinder API:

```javascript
// app/utils/petfinder.js
export async function fetchAnimals(zipCode, types = []) {
  let url = `https://petfinder.lyori6ux.workers.dev/?zip=${zipCode}`;
  
  if (types.length > 0) {
    url += `&types=${types.join(',')}`;
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.animals || [];
  } catch (error) {
    console.error("Error fetching animals:", error);
    throw error;
  }
}
```

### Key Endpoints Used

| Endpoint | Purpose | Parameters |
|----------|---------|------------|
| `/animals` | Get list of animals | `zip`, `type`, `page`, `limit` |
| `/animals/{id}` | Get details for a specific animal | `id` |
| `/types` | Get available animal types | None |

### Error Handling
- 401 Unauthorized: Re-authenticate and retry
- 404 Not Found: Show user-friendly empty state
- 429 Too Many Requests: Implement backoff strategy
- 5xx Server Errors: Display general error message with retry option

## OpenAI API

### Integration Purpose
The OpenAI API is used to generate personalized pet recommendations based on user preferences and available pets.

### API Details
- **Model**: GPT-4o-mini
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token

### Implementation

#### Prompt Engineering
The app uses a carefully crafted prompt to generate meaningful recommendations:

```javascript
const OPENAI_PROMPT = 
  "Based on these available animals, provide a single recommendation for the best match. " +
  "Your response should: " +
  "1. Select ONE specific pet from the list above; " +
  "2. Provide a friendly, compassionate explanation (2-3 sentences) of why this pet might be a good match; " +
  "3. Include 3 specific matching qualities (expressed as percentages between 70-95%) that make this pet a good companion. " +
  "Your response should ONLY include: " +
  "- Name of the selected pet " +
  "- Brief explanation of why it's a good match " +
  "- Three match qualities with percentages. " +
  "DO NOT include any other information. Keep your response concise and focused."
```

#### API Request
```javascript
const response = await fetch('/api/getAiRecommendation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    selectedTypes,
    zipCode,
    filteredAnimals: animals.slice(0, 10) // Limit to 10 animals for token efficiency
  }),
});
```

#### Response Parsing
The response is parsed to extract the name, explanation, and match qualities:

```javascript
interface AiRecommendation {
  name: string;
  explanation: string;
  matchQualities: {
    quality: string;
    percentage: number;
  }[];
}
```

#### Caching Implementation
Recommendations are cached in localStorage to reduce API calls:

```javascript
// Save to cache
localStorage.setItem('aiRecommendationCache', JSON.stringify({
  timestamp: Date.now(),
  zipCode,
  selectedTypes,
  recommendation
}));

// Retrieve from cache
const cachedData = JSON.parse(localStorage.getItem('aiRecommendationCache'));
if (cachedData && 
    cachedData.zipCode === zipCode && 
    arraysEqual(cachedData.selectedTypes, selectedTypes) &&
    Date.now() - cachedData.timestamp < 3600000) {
  return cachedData.recommendation;
}
```

### Rate Limiting & Error Handling
- Implement exponential backoff for retry attempts
- Cache successful responses to reduce API calls
- Provide graceful fallbacks when API is unavailable
- Monitor token usage to stay within budget constraints

## Geocoding Services

### Current Implementation
The app currently uses OpenStreetMap's Nominatim service for reverse geocoding:

```javascript
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
);
const data = await response.json();
const zipCode = data.address.postcode;
```

### Usage
Geocoding is used to automatically detect user location when they opt to "Use my location" instead of manually entering a zip code.

### Limitations & Future Improvements
- Rate limited to 1 request per second
- Accuracy issues in some regions
- Considering migration to Google Maps API for improved accuracy

## Environment Variables
The following environment variables are required for API integrations:

```
PETFINDER_API_KEY=your_petfinder_api_key
PETFINDER_SECRET=your_petfinder_secret
OPENAI_API_KEY=your_openai_api_key
```

## Security Considerations
- All API keys are stored as environment variables
- Server-side API calls whenever possible
- Rate limiting to prevent abuse
- Proper error handling to prevent information leakage
