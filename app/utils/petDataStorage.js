// Utility functions for debugging pet data storage

export function debugPetData() {
  if (typeof window === 'undefined') {
    return null;
  }

  // Collect all pet-related data from localStorage
  const data = {
    timestamp: new Date().toISOString(),
    localStorage: {},
    sessionData: {}
  };

  // Get all localStorage items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const value = localStorage.getItem(key);
      data.localStorage[key] = value;
    } catch (error) {
      console.error(`Error reading localStorage key: ${key}`, error);
      data.localStorage[key] = `Error: ${error.message}`;
    }
  }

  // Get session storage data if available
  try {
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      try {
        const value = sessionStorage.getItem(key);
        data.sessionData[key] = value;
      } catch (error) {
        console.error(`Error reading sessionStorage key: ${key}`, error);
        data.sessionData[key] = `Error: ${error.message}`;
      }
    });
  } catch (error) {
    console.error('Error accessing sessionStorage:', error);
    data.sessionData = { error: error.message };
  }

  return data;
}
