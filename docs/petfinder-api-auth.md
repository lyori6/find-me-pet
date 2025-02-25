# Petfinder API Authentication

This document explains how authentication is handled with the Petfinder API in the FindMePet application.

## Authentication Flow

The Petfinder API uses OAuth 2.0 for authentication. Our application implements the client credentials flow:

1. The application requests an access token by sending a POST request to `https://api.petfinder.com/v2/oauth2/token` with:
   - `grant_type`: "client_credentials"
   - `client_id`: Your Petfinder API key
   - `client_secret`: Your Petfinder API secret

2. The Petfinder API returns an access token and expiration time (typically 3600 seconds / 1 hour)

3. The application caches this token in memory for subsequent requests

4. Before the token expires, the application automatically refreshes it

## Token Caching Strategy

To minimize authentication requests, the application implements a token caching strategy:

```javascript
// Cache for the access token
let tokenCache = {
  token: null,
  expiry: 0
};
```

The token expiration is set to one minute before the actual expiration time to provide a safety margin:

```javascript
tokenCache = {
  token: data.access_token,
  expiry: now + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
};
```

## Handling Token Expiration

When a token expires during a user session (e.g., when transitioning from search results to pet details), the application:

1. Detects the 401 Unauthorized response from the Petfinder API
2. Forcibly resets the token cache: `resetTokenCache()`
3. Requests a new token: `getAccessToken(true)`
4. Retries the failed API request with the new token
5. Returns the results to the user

This approach ensures a seamless user experience without errors when tokens expire.

## Implementation Details

The token handling is implemented in three key areas:

1. **Token Management Utility** (`app/utils/petfinder.js`)
   - Handles token acquisition, caching, and refreshing
   - Provides functions to reset the token cache

2. **API Endpoints** (`app/api/pet/[id]/route.js` and `app/api/search/route.js`)
   - Include token expiration detection
   - Implement automatic retry with fresh tokens

3. **Client Components** (`PetDetailsClient.js` and `ResultsClient.js`)
   - Handle and display user-friendly error messages

## Best Practices

- All API keys are stored as environment variables, never in the client-side code
- Token caching reduces the number of authentication requests
- Automatic token refresh provides a seamless user experience
- Clear error handling informs users when something goes wrong

## Troubleshooting

If you encounter authentication issues:

1. Verify that your Petfinder API key and secret are correctly set in `.env.local`
2. Check the server logs for token-related error messages
3. Clear your browser cache and try again
4. Ensure your Petfinder API key has not been revoked or reached its rate limit
