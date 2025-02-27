# Pet Search Flows

## Overview

FindMePet offers two distinct search flows to accommodate different user preferences and scenarios:

1. **Standard Search Flow** - The primary search path with AI-powered pet recommendations
2. **Quick Search Flow** - An alternative path with filter-enabled results for faster browsing

This document outlines both flows, their implementation details, and the key differences between them.

## Standard Search Flow

The standard search process consists of the following steps:

1. User selects pet type(s) (dogs, cats, rabbits)
2. User enters their zip code
3. User views results with locked filters and AI recommendation

This flow is implemented via:
- `/app/search/page.tsx` - Entry point for the search
- `/app/results/ResultsClient.js` - Results display with AI recommendations
- `/app/components/SearchForm.js` - Form component for input collection

Key characteristics:
- **AI Recommendation**: Displays a top match based on AI analysis
- **Locked Filters**: Filter buttons are disabled to focus attention on the AI recommendation
- **Progressive Disclosure**: Guides users through a step-by-step process

## Quick Search Flow

The quick search process is a parallel flow that streamlines the search process:

1. User clicks "Quick Search" in the navigation
2. If a zip code is already saved in local storage, the user goes directly to filter-enabled results
3. If no zip code is saved, the user is taken to the zip code entry page first
4. User views results with enabled filters for custom filtering

This flow is implemented via:
- `/components/ui/quick-search-button.jsx` - Button component that triggers the quick search
- `/app/alt-results/page.js` - Page component for alternative results
- `/app/filtered-results/FilteredResultsClient.js` - Results display with enabled filters

Key characteristics:
- **Enabled Filters**: Users can freely filter results by pet type
- **No AI Recommendation**: Focuses on manual browsing and filtering
- **Direct Access**: Skips the pet type selection step when a zip code is already known

## Implementation Decisions

### Parallel Implementation Strategy

We deliberately created separate pages for the filter-enabled results rather than conditionally rendering different UI states within the same page. This approach offers several advantages:

1. **Code Separation**: Keeps the two flows isolated, making it easier to maintain and modify each flow independently
2. **Clear Navigation Paths**: Users have distinct URLs for each flow, enabling direct linking and clear navigation history
3. **Performance**: Smaller component trees for each page, potentially improving rendering performance
4. **Future Extensibility**: Each flow can be enhanced independently without affecting the other

### Shared Components

Both flows leverage common components and utilities:

- **PetCard**: Used to display individual pet information
- **Storage Utilities**: Common functions for handling zip codes and preferences
- **API Integration**: Same backend API endpoints for retrieving pet data

## Usage Guidelines

- **Standard Search**: Recommended for new users or those seeking personalized recommendations
- **Quick Search**: Ideal for returning users who want to quickly browse available pets with custom filters

## Future Enhancements

Potential improvements for search flows:

1. User preference saving to remember which flow was last used
2. Additional filtering options in the filter-enabled view
3. Analytics to track usage patterns between the two flows
4. Performance optimizations for faster initial loading
