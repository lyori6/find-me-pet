/**
 * Type definitions for Google Tag Manager
 */

interface Window {
  dataLayer: any[];
  google_tag_manager?: Record<string, any>;
}

// Extend the existing Window interface
declare global {
  interface Window {
    dataLayer: any[];
    google_tag_manager?: Record<string, any>;
  }
}
