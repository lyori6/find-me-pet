/**
 * Google Tag Manager utility functions for tracking events
 */

// Define event types for better TypeScript support
interface GTMEvent {
  event: string;
  [key: string]: any;
}

/**
 * Type guard to ensure window is defined (for SSR compatibility)
 */
const isWindowDefined = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Push an event to the dataLayer
 * @param event The event object to push to the dataLayer
 */
export function pushEvent(event: GTMEvent): void {
  if (!isWindowDefined()) return;
  
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);
  } catch (error) {
    // Silently fail to avoid breaking the app
    console.warn('Error pushing event to dataLayer:', error);
  }
}

/**
 * Track a custom event
 * @param eventName The name of the event
 * @param eventData Additional data to include with the event
 */
export function trackEvent(
  eventName: string, 
  eventData: Record<string, any> = {}
): void {
  pushEvent({
    event: eventName,
    ...eventData,
  });
}

/**
 * Track when a user initiates the pet search process
 * @param searchFilters The filters used in the search
 */
export function trackPetSearch(searchFilters: Record<string, any>): void {
  trackEvent('pet_search_initiated', {
    searchFilters,
    timestamp: isWindowDefined() ? new Date().toISOString() : '',
  });
}

/**
 * Track when a user views a specific pet's details
 * @param petId The ID of the pet
 * @param petInfo Basic information about the pet
 */
export function trackPetView(
  petId: string, 
  petInfo: { 
    name?: string; 
    type?: string; 
    breed?: string;
    location?: string;
  }
): void {
  trackEvent('pet_view', {
    petId,
    petInfo,
  });
}

/**
 * Track when a user initiates contact about a pet
 * @param petId The ID of the pet
 * @param contactMethod The method used to contact (email, phone, etc)
 */
export function trackPetContactInitiated(
  petId: string,
  contactMethod: string
): void {
  trackEvent('pet_contact_initiated', {
    petId,
    contactMethod,
  });
}
