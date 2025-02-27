'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  trackPageView, 
  trackInteraction, 
  trackFormSubmission, 
  trackFilterApplication 
} from '@/app/utils/analytics';

/**
 * Custom hook for tracking page views
 */
export function usePageViewTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when pathname or search params change
    if (pathname) {
      const pageTitle = document.title;
      const queryString = searchParams?.toString();
      const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
      
      trackPageView(fullPath, pageTitle);
    }
  }, [pathname, searchParams]);
}

/**
 * Custom hook for tracking form submissions
 * @param {string} formName - Name of the form
 * @returns {Function} - Function to call when form is submitted
 */
export function useFormSubmissionTracking(formName) {
  return (formData) => {
    trackFormSubmission(formName, formData);
  };
}

/**
 * Custom hook for tracking filter applications
 * @returns {Function} - Function to call when filters are applied
 */
export function useFilterTracking() {
  return (filters) => {
    trackFilterApplication(filters);
  };
}

/**
 * Custom hook for tracking general interactions
 * @param {string} category - Category of the interaction
 * @returns {Function} - Function to call when interaction occurs
 */
export function useInteractionTracking(category) {
  return (action, label, value) => {
    trackInteraction(action, category, label, value);
  };
}
