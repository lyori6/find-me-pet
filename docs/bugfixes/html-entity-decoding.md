# HTML Entity Decoding Bug Fix

## Issue

The application was displaying raw HTML entities (like `&#039;` for apostrophes) in pet descriptions on the results pages. This issue was not present on individual pet detail pages.

For example, text that should have displayed as:
```
"Please note: This is a courtesy post. Pound Puppy Rescue is supporting the foster's efforts to..."
```

Instead displayed as:
```
"Please note: This is a courtesy post. Pound Puppy Rescue is supporting the foster&#039;s efforts to..."
```

## Investigation

Upon investigation, we found that the individual pet details page (`PetDetailsClient.js`) was correctly using the `decode` function from the `html-entities` package to decode HTML entities in pet descriptions:

```javascript
// From app/pet/[id]/PetDetailsClient.js
const description = pet?.description ? decode(pet.description) : 'No description available';
```

However, the `PetCard` component used on both the main results page and quick search results page was not decoding the HTML entities:

```javascript
// From app/components/PetCard.js - before fix
const description = pet?.description ? 
    (pet.description.length > 100 ? `${pet.description.substring(0, 100)}...` : pet.description) : 
    'No description available';
```

## Solution

### Initial Fix

The initial solution was to apply the same HTML entity decoding in the `PetCard` component:

1. Import the `decode` function from the `html-entities` package
2. Apply the `decode` function to pet descriptions before displaying them

```javascript
// From app/components/PetCard.js - after initial fix
import { decode } from 'html-entities';

// ...

const description = pet?.description ? 
    (pet.description.length > 100 ? `${decode(pet.description).substring(0, 100)}...` : decode(pet.description)) : 
    'No description available';
```

### Enhanced Fix

Since the initial fix didn't fully resolve the issue, we created a centralized utility function for HTML entity decoding to ensure consistent handling across the application:

1. Created a new utility module `app/utils/textUtils.js` with a dedicated function for HTML entity decoding:

```javascript
// app/utils/textUtils.js
import { decode as decodeHtml } from 'html-entities';

export function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  try {
    return decodeHtml(text);
  } catch (error) {
    console.error('Error decoding HTML entities:', error);
    return text;
  }
}
```

2. Updated the PetCard component to use this utility function with more robust error handling:

```javascript
// From app/components/PetCard.js - enhanced fix
import { decodeHtmlEntities } from '../utils/textUtils';

// ...

// Ensure description is decoded
let decodedDescription = '';
if (pet?.description) {
  decodedDescription = decodeHtmlEntities(pet.description);
  if (decodedDescription.length > 100) {
    decodedDescription = `${decodedDescription.substring(0, 100)}...`;
  }
} else {
  decodedDescription = 'No description available';
}

// Then in the JSX:
<p className="text-sm text-muted-foreground line-clamp-2 mt-3">{decodedDescription}</p>
```

3. Updated the PetDetailsClient component to use the same utility function for consistency:

```javascript
// From app/pet/[id]/PetDetailsClient.js
import { decodeHtmlEntities } from '@/app/utils/textUtils';

// ...

const description = pet?.description ? decodeHtmlEntities(pet.description) : 'No description available';

// And in the renderDescription function:
<div 
  ref={descriptionRef}
  className={`text-gray-600 mt-2 overflow-hidden ${!showFullDescription ? 'max-h-[200px]' : ''}`}
  dangerouslySetInnerHTML={{ 
    __html: decodeHtmlEntities(pet.description || '')
  }}
/>
```

This ensures consistent handling of HTML entities across all pages in the application and provides better error handling.

## Affected Files

- `/app/components/PetCard.js`
- `/app/pet/[id]/PetDetailsClient.js`
- `/app/utils/textUtils.js` (new file)

## Related Files (for context)

- `/app/results/ResultsClient.js`
- `/app/filtered-results/FilteredResultsClient.js`
- `/app/alt-results/page.js`
