/**
 * Utility functions for text processing
 */

import { decode as decodeHtml } from 'html-entities';

/**
 * Decodes HTML entities in a string, handling both single and double-encoded entities
 * @param {string} text - The text to decode
 * @returns {string} Decoded text
 */
export function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  try {
    // First decode pass (handles normal encoding)
    let decoded = decodeHtml(text);
    
    // Handle potential double-encoded entities
    // First check for &amp; which is a common double encoding pattern
    if (decoded.includes('&amp;')) {
      // Replace &amp; with & directly (common double-encoding pattern)
      decoded = decoded.replace(/&amp;/g, '&');
      // Second decode pass (handles entities that were double-encoded)
      decoded = decodeHtml(decoded);
    }
    
    // Extra check for specific common patterns like &#039; that might still be present
    if (decoded.includes('&#039;') || decoded.includes('&#39;')) {
      decoded = decoded.replace(/&#0?39;/g, "'");
    }
    
    // Extra debugging
    console.log('Decoding:', { original: text, decoded });
    
    return decoded;
  } catch (error) {
    console.error('Error decoding HTML entities:', error);
    return text;
  }
}
