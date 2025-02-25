/**
 * Utility functions for handling zip codes
 */

/**
 * Validates a zip code format (5 digits)
 * @param {string} zipCode - The zip code to validate
 * @returns {boolean} - Whether the zip code is valid
 */
export function validateZipCode(zipCode) {
  return /^\d{5}$/.test(zipCode);
}

/**
 * Cleans a zip code by removing non-digits and limiting to 5 characters
 * @param {string} zipCode - The zip code to clean
 * @returns {string} - The cleaned zip code
 */
export function cleanZipCode(zipCode) {
  return zipCode.replace(/\D/g, '').slice(0, 5);
}

/**
 * Gets a zip code from multiple possible sources
 * @param {Object} options - Options for getting the zip code
 * @param {string} options.urlZipCode - Zip code from URL parameters
 * @param {boolean} options.useStorage - Whether to check localStorage
 * @returns {string|null} - The zip code or null if not found
 */
export function getZipCode({ urlZipCode, useStorage = true }) {
  // First try URL parameter
  if (urlZipCode && validateZipCode(urlZipCode)) {
    return urlZipCode;
  }
  
  // Then try localStorage if enabled
  if (useStorage && typeof window !== 'undefined') {
    try {
      const petData = JSON.parse(localStorage.getItem('petData') || '{}');
      if (petData.zipCode && validateZipCode(petData.zipCode)) {
        return petData.zipCode;
      }
    } catch (error) {
      console.error('Error reading zip code from storage:', error);
    }
  }
  
  return null;
} 