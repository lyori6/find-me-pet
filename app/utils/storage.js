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