# Environment Variables Template

This file provides a template for the required environment variables in the `.env.local` file.

# OpenAI API key for AI recommendations
OPENAI_API_KEY=your_openai_api_key_here

# Cloudflare credentials
CLOUDFLARE_API_KEY=your_cloudflare_api_key_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id_here

# Turnstile credentials
TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here

# Petfinder API credentials
PETFINDER_API_KEY=rsecret_key_here
PETFINDER_API_SECRET=secret_key_here

## Important Note on Petfinder API Authentication

The application uses OAuth2 authentication with Petfinder API:

1. A bearer token is obtained using the client credentials flow
2. The token has a default expiration time of 1 hour (3600 seconds)
3. If a token expires during user interaction, the app automatically requests a new one
4. Tokens are cached in memory to minimize authentication requests
5. When an expired token is detected, the application will:
   - Reset the token cache
   - Request a fresh token
   - Retry the failed operation with the new token
   - Return the results to the user

This ensures uninterrupted user experience even when tokens expire during user sessions.

# API URL
NEXT_PUBLIC_API_URL=https://api.petfinder.com/v2

## Notes on AI Implementation

- We're using the `gpt-4o-mini` model for AI recommendations
- The OpenAI API is called from the `/api/getAiRecommendation` endpoint
- Recommendations are cached in localStorage to minimize API usage
- The AI component handles loading states, errors, and retry functionality

## Security Considerations

- Never commit your actual API keys to GitHub
- For production, consider moving the OpenAI API calls to a serverless function
- Implement rate limiting to prevent excessive API usage
- Monitor API costs, especially when using more advanced models like GPT-4

## Future Enhancements

- Move the prompt to a cloud function or environment variable
- Add user feedback mechanism for recommendation quality
- Implement analytics to track recommendation effectiveness
- Consider A/B testing different prompt strategies