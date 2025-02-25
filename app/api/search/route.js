import { getAccessToken } from '@/app/utils/petfinder';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  const petTypes = searchParams.get('petTypes');
  
  if (!zipCode) {
    return Response.json({ error: 'Zip code is required' }, { status: 400 });
  }
  
  try {
    const token = await getAccessToken();
    
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
        const promises = types.map(type => {
          const typeUrl = `${apiUrl}&type=${type}`;
          console.log('Fetching from Petfinder API:', typeUrl);
          return fetch(typeUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(resp => resp.json());
        });

        // Wait for all requests to complete
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
      }
    }
    
    // If no types specified or empty types array, make a single request
    console.log('Fetching from Petfinder API:', apiUrl);
    
    // Add cache-control header to enable caching for 5 minutes
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      next: {
        revalidate: 300 // Cache for 5 minutes
      }
    });
    
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
      { error: 'Failed to fetch pets. Please try again later.' },
      { status: 500 }
    );
  }
}
