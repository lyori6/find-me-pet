import { getAccessToken } from '@/app/utils/petfinder';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  
  if (!zipCode) {
    return Response.json({ error: 'Zip code is required' }, { status: 400 });
  }
  
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://api.petfinder.com/v2/animals?location=${zipCode}&distance=25&sort=distance`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
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
