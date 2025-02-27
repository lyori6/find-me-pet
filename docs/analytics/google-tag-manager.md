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

### Data Layer Initialization

The data layer is initialized in two places to ensure proper loading:

1. A beforeInteractive script that creates the dataLayer array
2. In the useEffect hook of the GoogleTagManager component

### Page View Tracking

Page views are automatically tracked when the URL path or search parameters change using Next.js navigation hooks:

- `usePathname()` - Tracks changes to the URL path
- `useSearchParams()` - Tracks changes to URL query parameters

### Hydration Error Prevention

To prevent hydration errors (server/client rendering mismatches), the GTMNoScript component only renders on the client side using React's useEffect and useState hooks.

## Testing GTM Implementation

To verify the GTM implementation is working correctly:

1. Open the website in an incognito/private browser window
2. Open browser developer tools (F12 or right-click > Inspect)
3. Go to the Network tab and filter for "gtm.js"
4. You should see the GTM script loading successfully
5. Use the GTM Preview mode by going to https://tagmanager.google.com/ and entering your container ID

## Custom Event Tracking

You can track custom events by pushing to the dataLayer as follows:

```javascript
window.dataLayer.push({
  event: 'custom_event_name',
  eventCategory: 'category',
  eventAction: 'action',
  eventLabel: 'label',
  // Additional parameters as needed
});
```

## Troubleshooting

If GTM is not loading correctly:

1. Ensure there are no browser extensions blocking tracking scripts
2. Check that the GTM container ID is correct
3. Verify the script is not being blocked by Content Security Policy (CSP)
4. Check for any JavaScript errors in the console
5. Ensure the GoogleTagManager component is included in the layout file
