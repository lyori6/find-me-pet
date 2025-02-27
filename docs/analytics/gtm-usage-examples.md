# Google Tag Manager Usage Examples

This document provides examples of how to use the GTM tracking utilities in your components.

## Basic Event Tracking

```tsx
'use client';

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/gtm";

export default function SubmitButton() {
  const handleClick = () => {
    // Track the button click
    trackEvent('button_click', {
      buttonId: 'submit_form',
      page: window.location.pathname,
    });
    
    // Continue with form submission
    // ...
  };

  return (
    <Button onClick={handleClick}>
      Submit
    </Button>
  );
}
```

## Tracking Pet Search

```tsx
'use client';

import { useState } from 'react';
import { trackPetSearch } from "@/lib/analytics/gtm";

export default function SearchForm() {
  const [filters, setFilters] = useState({
    type: 'dog',
    breed: '',
    location: '',
    age: '',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Track the search with filters
    trackPetSearch(filters);
    
    // Continue with search logic
    // ...
  };

  return (
    <form onSubmit={handleSearch}>
      {/* Form fields */}
    </form>
  );
}
```

## Tracking Pet Views

```tsx
'use client';

import { useEffect } from 'react';
import { trackPetView } from "@/lib/analytics/gtm";

export default function PetDetails({ pet }) {
  useEffect(() => {
    // Track that the user viewed this pet
    trackPetView(pet.id, {
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      location: pet.location,
    });
  }, [pet]);

  return (
    <div>
      <h1>{pet.name}</h1>
      {/* Pet details */}
    </div>
  );
}
```

## Tracking Contact Initiations

```tsx
'use client';

import { Button } from "@/components/ui/button";
import { trackPetContactInitiated } from "@/lib/analytics/gtm";

export default function ContactButtons({ petId }) {
  const handleEmailContact = () => {
    trackPetContactInitiated(petId, 'email');
    // Continue with email contact logic
  };

  const handlePhoneContact = () => {
    trackPetContactInitiated(petId, 'phone');
    // Continue with phone contact logic
  };

  return (
    <div className="flex gap-4">
      <Button onClick={handleEmailContact}>
        Email
      </Button>
      <Button onClick={handlePhoneContact}>
        Call
      </Button>
    </div>
  );
}
```

## Tracking Form Completions

```tsx
'use client';

import { useState } from 'react';
import { trackEvent } from "@/lib/analytics/gtm";

export default function AdoptionForm({ petId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    // Other form fields
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Track the form submission
    trackEvent('adoption_form_submitted', {
      petId,
      formFields: Object.keys(formData),
      timestamp: new Date().toISOString(),
    });
    
    // Continue with form submission logic
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Tracking Page Load Performance

```tsx
'use client';

import { useEffect } from 'react';
import { trackEvent } from "@/lib/analytics/gtm";

export default function PerformanceTracker() {
  useEffect(() => {
    // Wait for the page to fully load
    window.addEventListener('load', () => {
      // Use the Performance API to get timing metrics
      if (performance && performance.timing) {
        const timing = performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        const domReadyTime = timing.domComplete - timing.domLoading;
        
        trackEvent('page_performance', {
          pageLoadTime,
          domReadyTime,
          url: window.location.pathname,
        });
      }
    });
  }, []);

  return null; // This is a utility component with no UI
}
```
