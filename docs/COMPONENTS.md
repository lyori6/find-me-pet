# Component Library

## Overview
FindMePet uses a collection of reusable components built with React, TailwindCSS, and Radix UI primitives. This document provides an overview of the key components, their usage, and implementation details.

## Core Components

### AI Recommendation

**File**: `/components/ai-recommendation.tsx`

**Purpose**: Displays an AI-generated pet recommendation based on search results.

**Props**:
```typescript
interface AiRecommendationProps {
  animals: Animal[];
  zipCode: string;
  selectedTypes: string[];
  className?: string;
}
```

**Key Features**:
- Fetches personalized AI recommendations
- Displays recommendation with matching percentages
- Handles loading, error, and success states
- Implements caching for performance optimization
- Provides manual refresh capability

**Usage Example**:
```jsx
<AiRecommendation 
  animals={animals}
  zipCode="90210"
  selectedTypes={["Dog", "Cat"]}
  className="mt-4"
/>
```

### Pet Card

**File**: `/components/pet-card.tsx`

**Purpose**: Displays information about an individual pet in the search results.

**Props**:
```typescript
interface PetCardProps {
  animal: Animal;
  className?: string;
}
```

**Key Features**:
- Responsive image display with fallback
- Key pet information presentation
- Consistent styling
- Link to detailed pet information

**Usage Example**:
```jsx
<PetCard animal={animalData} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2" />
```

### Simple Gallery

**File**: `/app/components/SimpleGallery.js`

**Purpose**: Provides a lightweight, responsive gallery component for displaying pet images with intuitive navigation.

**Props**:
```typescript
interface SimpleGalleryProps {
  photos: {
    small: string;
    medium: string;
    large: string;
    full: string;
  }[];
  petName?: string;
  className?: string;
}
```

**Key Features**:
- Responsive design that adapts to mobile and desktop
- Square aspect ratio on mobile, 4:3 on desktop
- Touch swipe navigation for mobile users
- Large, accessible navigation buttons with semi-transparent background
- Image counter in bottom-right corner (only shown if multiple images)
- Optimized image loading with Next.js Image

**Usage Example**:
```jsx
// Basic usage
<SimpleGallery 
  photos={pet.photos} 
  petName={pet.name}
  className="shadow-lg"
/>
```

### Progressive Question

**File**: `/components/progressive-question.tsx`

**Purpose**: Implements the step-by-step questionnaire flow.

**Props**:
```typescript
interface ProgressiveQuestionProps {
  steps: ReactNode[];
  onComplete: (data: any) => void;
  initialStep?: number;
  className?: string;
}
```

**Key Features**:
- Multi-step form navigation
- Progress indication
- Data collection across steps
- Validation before progression

**Usage Example**:
```jsx
<ProgressiveQuestion
  steps={[<PetTypeStep />, <LocationStep />]}
  onComplete={handleSearchSubmit}
  className="max-w-md mx-auto"
/>
```

### Location Step

**File**: `/components/location-step.tsx`

**Purpose**: Collect and validate location information from the user.

**Props**:
```typescript
interface LocationStepProps {
  onSubmit: (zipCode: string) => void;
  className?: string;
}
```

**Key Features**:
- Zip code input with validation
- Geolocation detection
- Loading states during detection
- Error handling for invalid inputs

**Usage Example**:
```jsx
<LocationStep onSubmit={handleZipCodeSubmit} className="mt-4" />
```

### QuickSearchButton

**File**: `/components/ui/quick-search-button.jsx`

**Purpose**: A button component that enables direct access to the filtered results page.

**Behavior**:
- Checks for a stored zip code in the browser's local storage
- If a zip code exists, navigates to the alternative results page with filters enabled
- If no zip code exists, navigates to the search page to collect zip code

**Implementation Details**:
- Uses client-side navigation with window.location.href
- Provides loading state feedback during navigation

**Example Usage**:
```jsx
<QuickSearchButton />
```

### FilteredResultsClient

**File**: `/app/filtered-results/FilterResultsClient.js`

**Purpose**: An alternative to the main results client that enables filter functionality.

**Props**:
```typescript
interface FilteredResultsClientProps {
  initialZipCode?: string;
}
```

**Key Features**:
- Displays pet search results in a responsive grid
- Enables pet type filtering (dogs, cats, rabbits)
- Implements pagination with "Load More" functionality
- Shares caching mechanism with the standard results page
- Excludes AI recommendation component

**Implementation Details**:
- Uses same API endpoints as the standard results page
- Filter state updates trigger re-fetching of data
- Uses the same PetCard component as the main results page

### LoadingSpinner

**File**: `/app/components/LoadingSpinner.js`

**Purpose**: Provides a consistent, modern loading animation across the application.

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  text?: string | null;
  textPosition?: 'top' | 'bottom' | 'left' | 'right';
}
```

**Key Features**:
- Modern gradient animation using primary and secondary colors
- Multiple size options for different contexts
- Support for descriptive text with flexible positioning
- Accessibility support with proper ARIA labels
- Consistent styling across the application

**Usage Example**:
```jsx
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

**Implementation Details**:
- Uses Framer Motion for smooth animations
- Implements a dual-layer approach with static and animated elements
- Detailed documentation available in [/docs/ui/LOADING-STATES.md](/docs/ui/LOADING-STATES.md)

## UI Components

The app uses a collection of UI primitive components built with Radix UI. These components provide the foundation for building more complex components with consistent styling and behavior.

### Button

**File**: `/components/ui/button.tsx`

**Key Variants**:
- Default
- Outline
- Secondary
- Ghost
- Link

**Usage Example**:
```jsx
<Button variant="default" size="lg" onClick={handleClick}>
  Search Pets
</Button>
```

### Input

**File**: `/components/ui/input.tsx`

**Features**:
- Consistent styling
- Error state support
- Icon integration
- Size variants

**Usage Example**:
```jsx
<Input 
  type="text" 
  placeholder="Enter zip code" 
  value={zipCode}
  onChange={(e) => setZipCode(e.target.value)}
  className="w-full"
/>
```

### Checkbox

**File**: `/components/ui/checkbox.tsx`

**Features**:
- Custom styling
- Accessible implementation
- Support for indeterminate state
- Label integration

**Usage Example**:
```jsx
<Checkbox 
  id="dogs" 
  checked={selectedTypes.includes("Dog")}
  onCheckedChange={(checked) => {
    handleTypeSelection("Dog", checked === true);
  }}
/>
<Label htmlFor="dogs">Dogs</Label>
```

## Page Components

### Results Client

**File**: `/app/results/results-client.tsx`

**Purpose**: Client-side component that handles the search results display and interactions.

**Key Features**:
- Fetches pet data based on search parameters
- Manages loading and error states
- Renders pet cards in a responsive grid
- Integrates the AI recommendation component
- Handles filter UI (locked to initial selection)

**Implementation Details**:
- Uses useEffect for data fetching
- Implements pagination
- Handles URL parameter state
- Provides retry functionality
- Manages localStorage synchronization

### Questionnaire

**File**: `/components/questionnaire.tsx`

**Purpose**: Orchestrates the pet type selection and location input flow.

**Key Features**:
- Multi-step form navigation
- Data collection and validation
- Progress indication
- Submission handling

**Implementation Details**:
- Uses ProgressiveQuestion component
- Manages form state across steps
- Handles navigation between steps
- Saves responses to localStorage
- Redirects to results page upon completion

## Best Practices for Component Development

1. **Component Structure**:
   - Keep components focused on a single concern
   - Use composition over complex props
   - Implement proper TypeScript typing

2. **Styling**:
   - Use TailwindCSS utility classes
   - Leverage className prop for customization
   - Maintain consistent spacing and sizing
   - Support dark mode where appropriate

3. **State Management**:
   - Use hooks effectively (useState, useEffect, useRef)
   - Avoid prop drilling with context where appropriate
   - Consider performance implications of re-renders

4. **Accessibility**:
   - Include proper ARIA attributes
   - Ensure keyboard navigation works
   - Maintain sufficient color contrast
   - Test with screen readers

5. **Testing**:
   - Write unit tests for complex logic
   - Test edge cases and failure modes
   - Verify responsive behavior

6. **Documentation**:
   - Document props with TypeScript interfaces
   - Include usage examples
   - Note any side effects or dependencies
   - Update documentation when component behavior changes
