// Cache for the access token
let tokenCache = {
  token: null,
  expiry: 0
};

/**
 * Get an access token for the Petfinder API
 * @returns {Promise<string>} The access token
 */
export async function getAccessToken() {
  // Check if we have a valid cached token
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiry > now) {
    return tokenCache.token;
  }

  // Otherwise, get a new token
  try {
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
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    
    // Cache the token
    tokenCache = {
      token: data.access_token,
      expiry: now + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
    };
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting Petfinder access token:', error);
    throw error;
  }
}

/**
 * Search for animals using the Petfinder API
 * @param {string} zipCode - The zip code to search near
 * @param {number} limit - The maximum number of results to return
 * @returns {Promise<Array>} The animals found
 */
export async function searchAnimals(zipCode, limit = 25) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://api.petfinder.com/v2/animals?location=${zipCode}&distance=25&sort=distance&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error('Failed to fetch animals: ' + (error.detail || error.message || 'Unknown error'));
    }

    const data = await response.json();
    return data.animals;
  } catch (error) {
    console.error('Petfinder search error:', error);
    throw error;
  }
}

/**
 * Get details for a specific animal
 * @param {string} id - The animal ID
 * @returns {Promise<Object>} The animal details
 */
export async function getAnimal(id) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://api.petfinder.com/v2/animals/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error('Failed to fetch animal details: ' + (error.detail || error.message || 'Unknown error'));
    }

    const data = await response.json();
    return data.animal;
  } catch (error) {
    console.error('Petfinder get animal error:', error);
    throw error;
  }
}
