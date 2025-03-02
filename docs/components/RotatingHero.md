# RotatingHero Component

A premium hero section with rotating pet names and background images that creates a modern, welcoming first impression for the FindMePet application.

## Features

- Dark gradient background that ensures text readability at all times
- Fallback system that looks great even if images fail to load
- Animated pet name rotation with smooth transitions
- Responsive layout that works on all device sizes
- Clear call-to-action buttons with hover effects
- Pagination dots for manual navigation
- Text shadows for enhanced legibility against any background

## Usage

```jsx
import RotatingHero from '@/app/components/RotatingHero';

// Basic usage - no props required
<RotatingHero />
```

## Implementation Details

1. **Layered Design Approach**:
   - Base layer: Dark gradient background (slate-900 to black) that's always visible
   - Middle layer: Pet images with reduced opacity for text readability
   - Top layer: Dark overlay to ensure consistent text contrast
   - Content layer: Text and buttons with proper shadows and z-indexing

2. **Text Animation**:
   - Uses Framer Motion for smooth transitions
   - Animates the pet name with fade and vertical motion
   - Text layout adjusts from stacked (mobile) to inline (desktop)
   - Gradient text effect on pet names with enhanced drop shadow

3. **Image Handling**:
   - Uses Next.js Image component for optimized loading
   - Graceful error handling if images fail to load
   - Proper alt text for accessibility
   - Responsive sizing with object-cover
   - Images should be placed in the `/homepage_pics/` directory
   - Correct image path format: `/homepage_pics/filename.jpeg`
   - Note that pet names in filenames use lowercase, but they are displayed in title case in the UI

4. **Navigation**:
   - Simple pagination dots for direct navigation
   - Automatic rotation every 4 seconds
   - Clear visual indication of current pet name

5. **Responsive Design**:
   - Uses min-h-screen to ensure proper display on all devices
   - Responsive padding that adjusts for mobile and desktop
   - Stacks buttons on mobile, side-by-side on desktop
   - Maintains readability and visual hierarchy at all breakpoints

## Image Setup

1. **Required Directory Structure**:
   - Pet images must be placed in `/homepage_pics/` directory
   - Use a naming convention like `[number]_[petname].jpeg`
   - Example: `1_shatsa.jpeg`, `2_greta.jpeg`, etc.

2. **Default Configuration**:
   - The component looks for images at paths like `/homepage_pics/1_shatsa.jpeg`
   - If images aren't found, a fallback from `/homepage_pics/placeholder-pet.jpg` is used
   - A dark gradient background is always visible regardless of image loading

3. **Adding New Pets**:
   - Add a new object to the pets array in RotatingHero.js:
   ```js
   { name: "NewPetName", imagePath: "/homepage_pics/8_newpetname.jpeg" }
   ```

## Performance Considerations

- Multiple layers ensure the component looks good in all scenarios
- Proper error handling prevents UI breaks if images fail to load
- Next.js Image component optimizes loading performance
- Simple animation effects that don't tax the browser
- Proper padding to ensure content is visible on all devices

## Pet Name Display
Pet names are stored in lowercase in the filenames but are displayed in title case in the UI.

## Troubleshooting

If images are not loading:
- Ensure images are in the correct location (`/homepage_pics/`)
- Verify image paths use the correct format (`/homepage_pics/filename.jpeg`)
- Check that image filenames match the paths in the component
- Confirm the fallback image exists at `/homepage_pics/placeholder-pet.jpg`
