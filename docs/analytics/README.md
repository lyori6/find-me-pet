# Analytics Implementation Guide

## Overview

This document provides guidance on how analytics are implemented in the FindMePet application. The application uses Google Tag Manager (GTM) to manage various tracking tags and events.

## Table of Contents

1. [Google Tag Manager Setup](#google-tag-manager-setup)
2. [Available Tracking Utilities](#available-tracking-utilities)
3. [Custom Hooks for Analytics](#custom-hooks-for-analytics)
4. [Common Tracking Scenarios](#common-tracking-scenarios)
5. [Testing and Debugging](#testing-and-debugging)

## Google Tag Manager Setup

The GTM container ID `GTM-K9XW5SRP` has been integrated into the application. For detailed implementation information, see [google-tag-manager.md](./google-tag-manager.md).

## Available Tracking Utilities

The application provides several utility functions for tracking different types of events. These are located in `/app/utils/analytics.js`:

- `pushEvent(eventName, eventParams)`: Generic function to push any event to the dataLayer
- `trackPageView(pagePath, pageTitle)`: Track page views
- `trackInteraction(action, category, label, value)`: Track user interactions
- `trackFormSubmission(formName, formData)`: Track form submissions
- `trackPetCardClick(petId, petName, petType)`: Track pet card clicks
- `trackFilterApplication(filters)`: Track filter applications
- `trackAdoptionLinkClick(petId, petName, destinationUrl)`: Track adoption link clicks

## Custom Hooks for Analytics

To simplify analytics implementation in React components, the application provides custom hooks in `/hooks/useAnalyticsTracking.js`:

- `usePageViewTracking()`: Automatically tracks page views when the path changes
- `useFormSubmissionTracking(formName)`: Returns a function to track form submissions
- `useFilterTracking()`: Returns a function to track filter applications
- `useInteractionTracking(category)`: Returns a function to track general interactions

### Example Usage

```jsx
import { usePageViewTracking, useFormSubmissionTracking } from '@/hooks/useAnalyticsTracking';

function MyComponent() {
  // Automatically track page views
  usePageViewTracking();
  
  // Get a function to track form submissions
  const trackFormSubmit = useFormSubmissionTracking('pet-questionnaire');
  
  const handleSubmit = (data) => {
    // Track the form submission
    trackFormSubmit(data);
    
    // Handle the form submission
    // ...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Common Tracking Scenarios

### Tracking Page Views

Page views are automatically tracked in the RootLayout component. If you need to track page views manually, you can use the `usePageViewTracking` hook or call `trackPageView` directly.

### Tracking User Interactions

```jsx
import { trackInteraction } from '@/app/utils/analytics';

function MyComponent() {
  const handleButtonClick = () => {
    trackInteraction('click', 'button', 'submit-button');
    // Handle the click
  };
  
  return (
    <button onClick={handleButtonClick}>Submit</button>
  );
}
```

### Tracking Form Submissions

```jsx
import { trackFormSubmission } from '@/app/utils/analytics';

function MyForm() {
  const handleSubmit = (data) => {
    trackFormSubmission('contact-form', {
      formType: 'contact',
      // Include non-sensitive form data
    });
    // Handle the submission
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Testing and Debugging

### Preview Mode

You can use GTM's preview mode to test your implementation:

1. Go to the [Google Tag Manager dashboard](https://tagmanager.google.com/)
2. Click "Preview" in the top-right corner
3. Enter your website URL and click "Start"
4. Navigate through your site and verify that events are firing correctly

### Chrome Extensions

Install the following Chrome extensions to help with debugging:

- [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-by-google/kejbdjndbnbjgmefkgdddjlbokphdefk)
- [dataLayer Inspector+](https://chrome.google.com/webstore/detail/datalayer-inspector/kmcbdogdandhihllalknlcjfpdjcleom)

### Console Debugging

You can also debug events in the browser console:

```javascript
// Monitor all dataLayer pushes
dataLayer.push = (function(originalPush) {
  return function(obj) {
    console.log('dataLayer push:', obj);
    return originalPush.apply(this, arguments);
  };
})(dataLayer.push);
```
