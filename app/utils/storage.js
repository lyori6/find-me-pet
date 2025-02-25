/**
 * Save zip code to localStorage
 * @param {string} zipCode - The zip code to save
 * @returns {string} The saved zip code
 */
export function saveZipCode(zipCode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('zipCode', zipCode);
  }
  return zipCode;
}

/**
 * Get zip code from localStorage
 * @returns {string|null} The zip code or null if not found
 */
export function getZipCode() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('zipCode');
  }
  return null;
}

/**
 * Validate a zip code format (5 digits)
 * @param {string} zipCode - The zip code to validate
 * @returns {boolean} Whether the zip code is valid
 */
export function validateZipCode(zipCode) {
  return /^\d{5}$/.test(zipCode);
}

/**
 * Save selected pet types to localStorage
 * @param {array} petTypes - The pet types to save
 */
export const saveSelectedPetTypes = (petTypes) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedPetTypes', JSON.stringify(petTypes));
  }
};

/**
 * Get selected pet types from localStorage
 * @returns {array} The saved pet types or an empty array if not found
 */
export const getSelectedPetTypes = () => {
  if (typeof window !== 'undefined') {
    const savedTypes = localStorage.getItem('selectedPetTypes');
    return savedTypes ? JSON.parse(savedTypes) : [];
  }
  return [];
};