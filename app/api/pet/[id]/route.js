import { getAccessToken } from '@/app/utils/petfinder';

export async function GET(request, { params }) {
  const { id } = params;
  
  if (!id) {
    return Response.json({ error: 'Pet ID is required' }, { status: 400 });
  }
  
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
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch pet details from Petfinder API');
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching pet details:', error);
    return Response.json(
      { error: 'Failed to fetch pet details. Please try again later.' },
      { status: 500 }
    );
  }
}
