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
          // Ensure proper capitalization for Petfinder API
          const singular = type.toLowerCase().endsWith('s') ? type.slice(0, -1) : type;
          return singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
        });
      
      if (types.length > 0) {
        // Petfinder API expects a single type parameter for each type
        const typeQueries = types.map(type => `type=${type}`);
        apiUrl += `&${typeQueries.join('&')}`;
      }
    }
    
    console.log('Fetching from Petfinder API:', apiUrl); // Add logging for debugging
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch pets from Petfinder API');
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return Response.json(
      { error: 'Failed to fetch pets. Please try again later.' },
      { status: 500 }
    );
  }
}
