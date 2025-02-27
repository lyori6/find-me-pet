# Top Match Pet Highlight Feature

## Overview

This document outlines the implementation plan for highlighting the AI's top recommended pet on the results page. The goal is to make the AI's recommendation visually prominent and easily identifiable among the other pet results.

## Feature Requirements

1. **Top Position**: Move the top-matched pet to the first position in the results grid
2. **Visual Distinction**: Add a subtle, iOS-style gradient border around the pet card
3. **Labeling**: Add a "Top Match" label with iOS-style design
4. **Animations**: Implement subtle hover animations to enhance the user experience
5. **Brand Consistency**: Use the app's color scheme for the highlight elements
6. **Responsive Design**: Ensure the feature works well across all device sizes

## UI/UX Design

The highlighted pet card features:

- A clean, visible gradient border that uses the app's primary-to-secondary color scheme
- A prominent, iOS-style "Top Match" badge in the top-right corner
- The badge includes a small star icon and uses gradient colors for visual interest
- Priority placement at the top of the results grid
- Subtle hover animations that lift the card slightly when interacted with

The design maintains the app's minimalistic aesthetic while making the top match clearly visible without overwhelming the user interface.

## Technical Implementation

### 1. Modify ResultsClient.js

We track the recommended pet ID from the AI recommendation component:

```javascript
// State to store the recommended pet ID
const [recommendedPetId, setRecommendedPetId] = useState(null);

// Handler for when AI recommendation is loaded
const handleRecommendationLoaded = (recommendation) => {
  if (recommendation?.petId) {
    setRecommendedPetId(recommendation.petId);
  }
};

// Sort the pets to put the recommended one first
const orderedPets = useMemo(() => {
  if (!recommendedPetId || filteredPets.length === 0) {
    return filteredPets;
  }
  const recommendedPet = filteredPets.find(pet => pet.id === recommendedPetId);
  return [recommendedPet, ...filteredPets.filter(pet => pet.id !== recommendedPetId)];
}, [filteredPets, recommendedPetId]);
```

### 2. Enhance PetCard.js

The PetCard component has been updated to support a clear visual distinction for the top match:

```javascript
{isTopMatch && (
  <>
    {/* Simple, more visible border */}
    <div 
      className="absolute -inset-[2px] rounded-[24px] z-0" 
      style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        opacity: 0.8
      }}
    />
    
    {/* Clean white space between border and card */}
    <div className="absolute -inset-[1px] bg-white rounded-[23px] z-[1]" />
    
    {/* Improved badge - more iOS-like with better feel */}
    <div className="absolute top-3 right-3 z-20">
      <div 
        className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center gap-1.5"
      >
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>Top Match</span>
      </div>
    </div>
  </>
)}

```

### 3. Responsive Design Considerations

The top match highlight has been designed to work well across different screen sizes:

- The gradient border maintains proper proportions on all device sizes
- The badge is positioned to be visible without overlapping important content
- Appropriate z-index values ensure all elements are properly layered

## API Changes

The backend API that provides AI recommendations needs to ensure it returns the pet ID along with the pet name and other recommendation data. The current implementation might need to be adjusted to include this information.

## Testing Plan

1. **Visual Testing**: Ensure the highlighted pet looks as expected across all device sizes
2. **Animation Testing**: Verify animations are subtle and not distracting
3. **Functional Testing**: Verify that the correct pet is highlighted based on the AI recommendation
4. **Performance Testing**: Ensure animations don't cause performance issues on mobile devices

## Implementation Timeline

1. **Backend Integration** (1 day):
   - Update the AI recommendation API to include pet ID

2. **Frontend Implementation** (2 days):
   - Modify ResultsClient.js to reorder results
   - Update AI recommendation component
   - Enhance PetCard component with top match styling and animations

## Design Considerations

The implementation follows these key design principles:

1. **Minimalism**: Clean, uncluttered design that aligns with iOS-style interfaces
2. **Subtle Distinction**: Highlighting the top match without overwhelming the user's experience
3. **Consistent Motion**: Gentle animations that provide visual interest without distraction
4. **Accessible Visuals**: Ensuring the highlight is perceivable without relying solely on color
