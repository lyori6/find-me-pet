# Google Tag Manager Implementation

This document explains how Google Tag Manager (GTM) is implemented in the FindMePet application.

## Overview

Google Tag Manager is implemented using Next.js App Router architecture with the following components:

1. `GoogleTagManager.tsx` - Main client component that initializes GTM and tracks page views
2. `GTMNoScript.tsx` - Client component that handles the noscript iframe (for users with JavaScript disabled)

These components are integrated into the application's root layout to ensure GTM is loaded on every page.

## Container ID

The application uses the GTM container ID: `GTM-K9XW5SRP`

## Implementation Details

### Next.js App Router Compatibility

When implementing GTM in Next.js App Router, there are several important considerations:

1. **Suspense Boundaries**: Components using `useSearchParams()` or other navigation hooks must be wrapped in `<Suspense>` to avoid build errors. Our implementation separates the page tracking logic into a separate component that's properly wrapped.

2. **Client Components**: All GTM-related components must use the `'use client'` directive since they interact with the browser's window object.

3. **Hydration Issues**: The noscript iframe is rendered only on the client side to prevent hydration mismatches between server and client rendering.

### Data Layer Initialization

The data layer is initialized in two places to ensure proper loading:

1. A beforeInteractive script that creates the dataLayer array
2. In the useEffect hook of the GoogleTagManager component

### Page View Tracking

Page views are automatically tracked when the URL path or search parameters change using Next.js navigation hooks:

- `usePathname()` - Tracks changes to the URL path
- `useSearchParams()` - Tracks changes to URL query parameters

### Build Errors Prevention

To prevent build errors with Next.js App Router static generation:

1. All components using `useSearchParams()` are wrapped in `<Suspense>` boundaries
2. Server-side rendering safe checks are implemented in utility functions
3. The GTM components are placed in strategic locations in the component tree

## Testing GTM Implementation

To verify the GTM implementation is working correctly:

1. Visit the `/gtm-test` page in the application to check GTM status
2. Open browser developer tools (F12 or right-click > Inspect)
3. Go to the Network tab and filter for "gtm.js"
4. You should see the GTM script loading successfully
5. Use the GTM Preview mode by going to https://tagmanager.google.com/ and entering your container ID

## Custom Event Tracking

You can track custom events by using the utility functions in `lib/analytics/gtm.ts`:

```javascript
import { trackEvent, trackPetSearch, trackPetView } from "@/lib/analytics/gtm";

// Track a custom event
trackEvent('button_click', { buttonId: 'submit' });

// Track a pet search
trackPetSearch({ type: 'dog', breed: 'Labrador' });

// Track a pet view
trackPetView('pet123', { name: 'Max', type: 'dog' });
```

## Troubleshooting

If GTM is not loading correctly:

1. Ensure there are no browser extensions blocking tracking scripts
2. Check that the GTM container ID is correct
3. Verify the script is not being blocked by Content Security Policy (CSP)
4. Check for any JavaScript errors in the console
5. Ensure the components are properly wrapped in Suspense boundaries

### Common Build Errors

If you encounter build errors like `useSearchParams() should be wrapped in a suspense boundary`, make sure:

1. Any component using `useSearchParams()` is wrapped in a `<Suspense>` boundary
2. The component is properly separated from the main GTM component
3. All client-side only code is properly guarded with checks for window existence
