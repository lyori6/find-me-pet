/**
 * Utility functions for working with Google Tag Manager
 */

/**
 * Push an event to the dataLayer
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Additional parameters for the event
 */
export const pushEvent = (eventName, eventParams = {}) => {
  // Make sure we're in the browser environment
  if (typeof window !== 'undefined') {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Push the event to the dataLayer
    window.dataLayer.push({
      event: eventName,
      ...eventParams
    });
  }
};

/**
 * Track a page view event
 * @param {string} pagePath - Path of the page being viewed
 * @param {string} pageTitle - Title of the page being viewed
 */
export const trackPageView = (pagePath, pageTitle) => {
  pushEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle
  });
};

/**
 * Track a user interaction event
 * @param {string} action - The action performed (e.g., 'click', 'submit')
 * @param {string} category - The category of the interaction (e.g., 'form', 'navigation')
 * @param {string} label - Additional label for the interaction
 * @param {number} value - Optional numeric value associated with the interaction
 */
export const trackInteraction = (action, category, label, value) => {
  pushEvent('user_interaction', {
    action,
    category,
    label,
    value
  });
};

/**
 * Track a form submission event
 * @param {string} formName - Name of the form being submitted
 * @param {Object} formData - Data submitted with the form (be careful not to include PII)
 */
export const trackFormSubmission = (formName, formData = {}) => {
  // Filter out any sensitive information if needed
  const safeFormData = { ...formData };
  
  pushEvent('form_submission', {
    form_name: formName,
    form_data: safeFormData
  });
};

/**
 * Track when a user clicks on a pet card
 * @param {string} petId - ID of the pet
 * @param {string} petName - Name of the pet
 * @param {string} petType - Type of pet (dog, cat, etc.)
 */
export const trackPetCardClick = (petId, petName, petType) => {
  pushEvent('pet_card_click', {
    pet_id: petId,
    pet_name: petName,
    pet_type: petType
  });
};

/**
 * Track when a user applies filters
 * @param {Object} filters - The filters that were applied
 */
export const trackFilterApplication = (filters) => {
  pushEvent('filter_application', {
    filters
  });
};

/**
 * Track when a user clicks on an adoption link
 * @param {string} petId - ID of the pet
 * @param {string} petName - Name of the pet
 * @param {string} destinationUrl - URL of the adoption site
 */
export const trackAdoptionLinkClick = (petId, petName, destinationUrl) => {
  pushEvent('adoption_link_click', {
    pet_id: petId,
    pet_name: petName,
    destination_url: destinationUrl
  });
};
