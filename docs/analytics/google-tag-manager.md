# Google Tag Manager Implementation

## Overview
Google Tag Manager (GTM) has been implemented in the FindMePet application to enable tracking and analytics across the site. GTM allows for easy management of various tracking tags without requiring code changes for each new tag or tracking requirement.

## Implementation Details

The GTM container ID `GTM-K9XW5SRP` has been integrated into the application using a dedicated client-side component that properly handles Next.js App Router requirements.

### Location of Implementation
- The GTM implementation is in a dedicated component at `/app/components/GoogleTagManager.js`
- The component is imported and used in the root layout file at `/app/layout.tsx`
- The implementation follows Next.js App Router best practices to avoid hydration errors

### Code Implementation

1. **GoogleTagManager Component**
   ```jsx
   // app/components/GoogleTagManager.js
   'use client';
   
   import Script from 'next/script';
   import { useEffect } from 'react';
   
   export default function GoogleTagManager() {
     // Handle page view tracking on client side
     useEffect(() => {
       if (typeof window !== 'undefined') {
         window.dataLayer = window.dataLayer || [];
         window.dataLayer.push({
           'event': 'page_view',
           'page_path': window.location.pathname,
           'page_title': document.title
         });
       }
     }, []);
   
     return (
       <>
         {/* Google Tag Manager - Script */}
         <Script
           id="gtm-script"
           strategy="afterInteractive"
           dangerouslySetInnerHTML={{
             __html: `
               (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
               new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
               j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
               'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
               })(window,document,'script','dataLayer','GTM-K9XW5SRP');
             `,
           }}
         />
         
         {/* Initialize dataLayer */}
         <Script
           id="gtm-datalayer-init"
           strategy="beforeInteractive"
           dangerouslySetInnerHTML={{
             __html: `
               window.dataLayer = window.dataLayer || [];
             `,
           }}
         />
       </>
     );
   }
   
   export function GoogleTagManagerNoScript() {
     return (
       <noscript>
         <iframe 
           src="https://www.googletagmanager.com/ns.html?id=GTM-K9XW5SRP"
           height="0" 
           width="0" 
           style={{ display: 'none', visibility: 'hidden' }}
         />
       </noscript>
     );
   }
   ```

2. **Usage in Root Layout**
   ```tsx
   // app/layout.tsx
   import GoogleTagManager, { GoogleTagManagerNoScript } from './components/GoogleTagManager';
   
   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en" className={sfPro.variable}>
         <head />
         <body className="font-sans">
           <GoogleTagManager />
           <GoogleTagManagerNoScript />
           <Providers>
             {/* Rest of the layout */}
           </Providers>
         </body>
       </html>
     );
   }
   ```

## Usage

### DataLayer
The implementation includes a `dataLayer` object that can be used to push events and data to GTM. To push events to the dataLayer, you can use the following pattern:

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': 'eventName',
  'eventProperty1': 'value1',
  'eventProperty2': 'value2'
});
```
 
### Common Events to Track
Consider tracking the following events:

1. **Page Views**: Automatically tracked by the GoogleTagManager component
2. **User Interactions**: 
   - Form submissions (questionnaire completion)
   - Pet card clicks
   - Filter selections
   - Navigation actions
3. **Conversion Events**:
   - Reaching the results page
   - Clicking on external adoption links

## Testing
To verify that GTM is working correctly:

1. Install the [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-by-google/kejbdjndbnbjgmefkgdddjlbokphdefk) Chrome extension
2. Visit the site and check that GTM is detected
3. Use the GTM preview mode to test tag firing

## Maintenance
Any future changes to tracking requirements should be managed through the GTM interface rather than changing the code implementation.
