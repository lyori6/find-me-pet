import { getAccessToken, resetTokenCache } from '@/app/utils/petfinder';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  const petTypes = searchParams.get('petTypes');
  
  if (!zipCode) {
    return Response.json({ error: 'Zip code is required' }, { status: 400 });
  }
  
  try {
    // Get an access token
    let token = await getAccessToken();
    
    // Build the API URL with filters
    let apiUrl = `https://api.petfinder.com/v2/animals?location=${zipCode}&distance=25&sort=distance&status=adoptable`;
    
    // Only add type filter if petTypes is not null, undefined, or 'any'
    if (petTypes && petTypes !== 'null' && petTypes !== 'any') {
      const types = petTypes.split(',')
        .filter(Boolean)
        .map(type => {
          // First convert to singular form if plural
          const singular = type.toLowerCase().replace(/s$/, '');
          // Then capitalize first letter
          return singular.charAt(0).toUpperCase() + singular.slice(1);
        });
      
      if (types.length > 0) {
        // Make a separate API call for each type and combine results
        const fetchWithType = async (type, retryWithNewToken = false) => {
          const typeUrl = `${apiUrl}&type=${type}`;
          console.log('Fetching from Petfinder API:', typeUrl);
          
          const response = await fetch(typeUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // If the token is expired and this is the first attempt, get a new token and retry
          if (response.status === 401 && !retryWithNewToken) {
            console.log('Token expired during type search, requesting a new one...');
            resetTokenCache();
            token = await getAccessToken(true);
            return fetchWithType(type, true);
          }
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to fetch pets: ${error.detail || error.message || 'Unknown error'}`);
          }
          
          return response.json();
        };
        
        try {
          // Wait for all requests to complete
          const promises = types.map(type => fetchWithType(type));
          const results = await Promise.all(promises);
          
          // Combine and deduplicate results
          const allAnimals = results.flatMap(result => result.animals || []);
          const uniqueAnimals = [...new Map(allAnimals.map(animal => [animal.id, animal])).values()];
          
          // Sort by distance since we're combining multiple requests
          const sortedAnimals = uniqueAnimals.sort((a, b) => a.distance - b.distance);
          
          // Return combined results
          return new Response(JSON.stringify({
            pagination: {
              count: sortedAnimals.length,
              total_count: results.reduce((sum, r) => sum + (r.pagination?.total_count || 0), 0)
            },
            animals: sortedAnimals
          }), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
            }
          });
        } catch (error) {
          throw error; // Re-throw to be handled by the outer catch
        }
      }
    }
    
    // If no types specified or empty types array, make a single request
    console.log('Fetching from Petfinder API:', apiUrl);
    
    // Add cache-control header to enable caching for 5 minutes
    let response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: 300 // Cache for 5 minutes
      }
    });
    
    // If the token is expired, get a new token and retry
    if (response.status === 401) {
      console.log('Token expired, requesting a new one...');
      resetTokenCache();
      token = await getAccessToken(true);
      
      try {
        const retryResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!retryResponse.ok) {
          if (retryResponse.status === 401) {
            throw new Error('Access token invalid or expired even after refresh');
          } else {
            const errorData = await retryResponse.json();
            throw new Error(errorData.detail || errorData.title || 'Failed to search for pets');
          }
        }
        
        const retryData = await retryResponse.json();
        return retryData;
      } catch (retryError) {
        console.error('Error searching pets after token refresh:', retryError);
        throw retryError;
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch pets from Petfinder API');
    }
    
    const data = await response.json();
    
    // Add logging to debug the response
    console.log('Petfinder API Response:', {
      total: data.pagination?.total_count,
      count: data.animals?.length,
      firstAnimal: data.animals?.[0]
    });
    
    // Return response with cache headers
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    return Response.json(
      { error: `Error fetching pets: ${error.message}` },
      { status: 500 }
    );
  }
}
