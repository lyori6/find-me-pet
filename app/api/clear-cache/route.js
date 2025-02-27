export async function GET() {
  // Clear only application's cache keys, not all sessionStorage
  if (typeof window !== 'undefined') {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('search_') || key.startsWith('pet_details_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ai_rec_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All pet caches cleared');
  }
  
  return Response.json({ success: true, message: 'Cache cleared' });
}
