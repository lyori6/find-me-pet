# Hero Images Directory

This directory contains the pet images used in the RotatingHero component on the homepage.

## Image Requirements

1. **Naming Convention**:
   - Images should be named using the format: `{order}_{petname}.jpeg`
   - For example: `1_shatsa.jpeg`, `2_greta.jpeg`, etc.
   - Note: Case sensitivity matters! Use lowercase filenames.

2. **Image Specifications**:
   - Recommended dimensions: 1920x1080px (16:9 ratio)
   - Format: JPEG (.jpeg extension)
   - Maximum file size: Keep under 200KB for optimal performance
   - Content: High-quality images of pets, ideally with good contrast for text visibility

3. **Current Images**:
   - 1_shatsa.jpeg
   - 2_greta.jpeg
   - 3_maria.jpeg
   - 4_simu.jpeg
   - 5_sardine.jpeg
   - 6_bao.jpeg
   - 7_oreo.jpeg

## Adding New Images

1. Add the image file to this directory following the naming convention
2. Update the `pets` array in `/app/components/RotatingHero.js` to include the new pet:

```javascript
const pets = [
  // Existing pets...
  { 
    name: "NewPet", 
    imagePath: "/homepage_pics/8_newpet.jpeg"
  },
];
```

## Image Path in Code

Images in this directory should be referenced with the following path format:

**Correct image path format:**
```javascript
// This is the correct format for images in this project
const imagePath = "/homepage_pics/1_shatsa.jpeg";
```

## Fallback Image

If an image fails to load, the component will use a fallback image located at:
`/homepage_pics/placeholder-pet.jpg`

Ensure this fallback image exists to maintain a consistent user experience.

## Important Notes

- Pet names in filenames are lowercase, but they are displayed in title case in the UI
- The dark overlay in the component helps ensure text readability even with bright images
- Images should be high quality but optimized for web to ensure fast loading
