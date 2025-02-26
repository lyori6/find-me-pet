// Cache for the access token
let tokenCache = {
  token: null,
  expiry: 0
};

/**
 * Get an access token for the Petfinder API
 * @param {boolean} forceRefresh - Whether to force a token refresh
 * @returns {Promise<string>} The access token
 */
export async function getAccessToken(forceRefresh = false) {
  // Check if we have a valid cached token and forceRefresh is false
  const now = Date.now();
  if (!forceRefresh && tokenCache.token && tokenCache.expiry > now) {
    console.log('Using cached token (expires in:', Math.round((tokenCache.expiry - now) / 1000), 'seconds)');
    return tokenCache.token;
  }

  // Otherwise, get a new token
  try {
    console.log('Requesting new Petfinder access token...');
    
    const response = await fetch('https://api.petfinder.com/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.PETFINDER_API_KEY,
        client_secret: process.env.PETFINDER_SECRET
      })
    });

    if (!response.ok) {
      let errorMessage = `Failed to get access token (HTTP ${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = `Failed to get access token: ${errorData.detail || errorData.message || errorData.error || 'Unknown error'}`;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = `Failed to get access token: ${response.statusText || 'Unknown error'}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate the token response
    if (!data.access_token || !data.expires_in) {
      throw new Error('Invalid token response from Petfinder API');
    }
    
    // Cache the token with a safety margin (subtract 2 minutes for safety)
    const safetyMarginMs = 2 * 60 * 1000; // 2 minutes
    tokenCache = {
      token: data.access_token,
      expiry: now + (data.expires_in * 1000) - safetyMarginMs
    };
    
    console.log(`New Petfinder token acquired (expires in ${Math.round(data.expires_in - safetyMarginMs/1000)} seconds)`);
    return data.access_token;
  } catch (error) {
    console.error('Error getting Petfinder access token:', error);
    throw error;
  }
}

/**
 * Reset the token cache, forcing a new token to be fetched on the next request
 */
export function resetTokenCache() {
  console.log('Resetting token cache');
  tokenCache = {
    token: null,
    expiry: 0
  };
}

/**
 * Force fetch a new token regardless of cache state
 */
export async function forceRefreshToken() {
  console.log('Forcing token refresh');
  resetTokenCache();
  
  try {
    // Wait a short delay to avoid potential API rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    const newToken = await getAccessToken(true);
    console.log('Token force refreshed successfully');
    return newToken;
  } catch (error) {
    console.error('Failed to force refresh token:', error);
    throw error;
  }
}

/**
 * Search for animals using the Petfinder API
 * @param {string} zipCode - The zip code to search near
 * @param {number} limit - The maximum number of results to return
 * @param {number} retryCount - The number of retries attempted
 * @returns {Promise<Array>} The animals found
 */
export async function searchAnimals(zipCode, limit = 25, retryCount = 0) {
  try {
    // Force token refresh on retry attempts
    const forceRefresh = retryCount > 0;
    const token = await getAccessToken(forceRefresh);
    
    console.log(`Searching animals near ${zipCode}, retry attempt: ${retryCount}`);
    
    const response = await fetch(
      `https://api.petfinder.com/v2/animals?location=${zipCode}&distance=25&sort=distance&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Prevent caching of the request
        cache: 'no-store'
      }
    );

    // If token is expired, reset cache and retry (up to 3 times)
    if (response.status === 401) {
      console.log(`Token expired during searchAnimals (attempt ${retryCount}), refreshing token...`);
      
      // Reset token cache to force a new token on next request
      resetTokenCache();
      
      // Allow up to 3 retry attempts
      if (retryCount < 3) {
        // Wait a short time before retrying to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For first retry, use the forceRefreshToken method to ensure a fresh token
        if (retryCount === 0) {
          await forceRefreshToken();
        }
        
        return searchAnimals(zipCode, limit, retryCount + 1);
      } else {
        throw new Error('Access token invalid or expired after multiple refresh attempts');
      }
    }

    if (!response.ok) {
      let errorMessage = `API error (status ${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        // If response.json() fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(`Failed to fetch animals: ${errorMessage}`);
    }

    const data = await response.json();
    return data.animals || [];
  } catch (error) {
    console.error('Petfinder search error:', error);
    throw error;
  }
}

/**
 * Get details for a specific animal
 * @param {string} id - The animal ID
 * @param {number} retryCount - The number of retries attempted
 * @returns {Promise<Object>} The animal details
 */
export async function getAnimal(id, retryCount = 0) {
  try {
    // Force token refresh on retry attempts
    const forceRefresh = retryCount > 0;
    const token = await getAccessToken(forceRefresh);
    
    console.log(`Fetching animal ${id}, retry attempt: ${retryCount}`);
    
    const response = await fetch(
      `https://api.petfinder.com/v2/animals/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Prevent caching of the request
        cache: 'no-store'
      }
    );

    // If token is expired, reset cache and retry (up to 3 times)
    if (response.status === 401) {
      console.log(`Token expired during getAnimal (attempt ${retryCount}), refreshing token...`);
      
      // Reset token cache to force a new token on next request
      resetTokenCache();
      
      // Allow up to 3 retry attempts
      if (retryCount < 3) {
        // Wait a short time before retrying to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For first retry, use the forceRefreshToken method to ensure a fresh token
        if (retryCount === 0) {
          await forceRefreshToken();
        }
        
        return getAnimal(id, retryCount + 1);
      } else {
        throw new Error('Access token invalid or expired after multiple refresh attempts');
      }
    }

    if (!response.ok) {
      let errorMessage = `API error (status ${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch (e) {
        // If response.json() fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(`Failed to fetch animal details: ${errorMessage}`);
    }

    const data = await response.json();
    
    // Make sure we have valid animal data before returning
    if (!data || !data.animal) {
      throw new Error('Invalid animal data returned from API');
    }
    
    // Initialize default values for properties that might be undefined
    const animal = {
      ...data.animal,
      breeds: data.animal.breeds || { primary: null, secondary: null },
      colors: data.animal.colors || { primary: null, secondary: null },
      photos: data.animal.photos || [],
      videos: data.animal.videos || []
    };
    
    return animal;
  } catch (error) {
    console.error('Petfinder get animal error:', error);
    throw error;
  }
}
