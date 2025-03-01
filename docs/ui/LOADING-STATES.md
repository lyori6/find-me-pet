# Loading States

## Overview

This document describes the loading state implementation across the FindMePet application. Loading states provide visual feedback to users when data is being fetched or processed, improving the perceived performance and user experience of the application.

## Implementation

The application uses a centralized `LoadingSpinner` component that provides consistent loading animations across all pages. This component has been designed with the following features:

- Modern gradient animation using the application's primary (red) and secondary (teal) colors
- Support for different sizes (small, default, large)
- Support for descriptive text that can be positioned in different locations (top, bottom, left, right)
- Accessibility support with proper ARIA labels

## Usage

The `LoadingSpinner` component is located at `/app/components/LoadingSpinner.js` and can be imported and used as follows:

```jsx
import LoadingSpinner from '@/app/components/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With size and text
<LoadingSpinner 
  size="large" 
  text="Loading pet details..." 
/>

// With text positioned to the right (useful for inline loading indicators)
<LoadingSpinner 
  size="small" 
  text="Detecting location..." 
  textPosition="right" 
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | string | `'default'` | Size of the spinner. Options: `'small'`, `'default'`, `'large'` |
| `text` | string | `null` | Optional text to display with the spinner |
| `textPosition` | string | `'bottom'` | Position of the text relative to the spinner. Options: `'top'`, `'bottom'`, `'left'`, `'right'` |

## Loading States Across the Application

The application implements loading states in the following key areas:

1. **Pet Details Page**
   - Shows when loading individual pet information
   - Displays personalized message with pet name when available

2. **Search Results Page**
   - Shows when fetching pets based on location and filters
   - Displays "Finding pets near you..." message

3. **Filtered Results Page**
   - Shows when applying filters to pet search results
   - Uses the same loading state as the Search Results page

4. **Location Detection**
   - Shows when detecting user's current location
   - Displays inline with the "Use my current location" button

## Design Considerations

- **Consistency**: The same loading animation style is used throughout the application to provide a consistent experience.
- **Contextual Feedback**: Loading messages are contextual to the operation being performed.
- **Branding**: The loading animation uses the application's primary and secondary colors to reinforce brand identity.
- **Accessibility**: The loading spinner includes proper ARIA labels for screen readers.

## Animation Details

The loading animation consists of:
- An outer static ring with a semi-transparent primary color
- An inner rotating ring with a gradient of primary and secondary colors
- A smooth rotation animation with a 1.5-second duration

This creates a modern, subtle animation that indicates activity without being distracting.
