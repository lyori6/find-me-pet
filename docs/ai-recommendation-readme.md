# AI Pet Recommendation System

## Overview

The AI Pet Recommendation system enhances the FindMePet application by providing personalized pet suggestions based on user preferences and available animals. It uses OpenAI's GPT-4o-mini model to analyze pet data and generate thoughtful, personalized recommendations.

## Components

### 1. API Endpoint

The `/api/getAiRecommendation` endpoint processes user preferences and available pets:

- **Input**: User's selected pet types, zip code, and filtered animal data
- **Processing**: Formats data and sends a prompt to OpenAI
- **Output**: Structured recommendation with pet ID, pet name, match reason, and compatibility stats

### 2. Frontend Component

The `AiRecommendation` React component renders the AI's suggestion:

- **Loading States**: Shows skeleton UI during API calls
- **Error Handling**: Displays error messages with retry options
- **Caching**: Stores recommendations in localStorage to reduce API calls
- **Refresh Capability**: Allows users to request new recommendations
- **Fallback Handling**: Gracefully handles missing data with intelligent defaults

## Implementation Details

### Data Flow

1. User selects pet types and enters zip code
2. Search results are displayed
3. AI recommendation component checks for cached recommendation
4. If no cache exists, it sends simplified pet data to the API endpoint
5. OpenAI generates a personalized recommendation
6. The recommendation is parsed and validated
7. Fallbacks are applied if needed (missing pet ID, name, etc.)
8. The recommendation is displayed and cached

### Prompt Design

The prompt is carefully designed to:
- Focus on specific pets from the search results
- Generate personalized reasoning for the match
- Provide quantifiable compatibility metrics
- Maintain a friendly, helpful tone
- Include explicit instructions on response format
- Require the AI to only recommend pets from the provided list

### Robust Error Handling

The system includes multiple layers of error handling:
- Detailed request validation and logging
- Detection of AI responses indicating missing pet data
- Multiple regex patterns for extracting pet information
- Fallback mechanisms when pet matching fails
- Simplified animal data to reduce payload size

## Usage

The AI recommendation appears automatically at the top of search results when pets are available. Users can:

- View their personalized recommendation
- Refresh to get a new recommendation
- Continue browsing all available pets

## Technical Requirements

- OpenAI API key in `.env.local`
- `openai` npm package
- Next.js API routes

## Future Enhancements

- Implement caching for pet data to reduce Petfinder API calls
- Add caching for AI recommendations with similar parameters
- Add user feedback mechanism for recommendation quality
- Implement A/B testing for different prompt strategies
- Track recommendation effectiveness through analytics
- Expand recommendation factors based on more user preferences

## Security Considerations

- API key is stored securely in environment variables
- Rate limiting should be implemented to prevent abuse
- Consider moving API calls to serverless functions for production
- Payload size optimization to reduce data transmission

## Debugging

The system includes comprehensive logging:
- API request details (zip code, selected types, number of animals)
- Sample pet data for verification
- Raw AI responses for troubleshooting
- Pet matching process (by ID or name)
- Fallback usage indicators
