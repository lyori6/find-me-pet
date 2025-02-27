'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Suspense, useEffect } from 'react';

// Your GTM ID
const GTM_ID = 'GTM-K9XW5SRP';

// Component that uses search params, wrapped in Suspense
function GTMPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    if (pathname) {
      // Push page view event to dataLayer when path changes
      window.dataLayer.push({
        event: 'page_view',
        page: {
          path: pathname,
          search: searchParams ? searchParams.toString() : '',
          title: document.title,
        },
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleTagManager() {
  return (
    <>
      {/* Initialize dataLayer array */}
      <Script
        id="gtm-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
          `,
        }}
      />
      
      {/* GTM Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      
      {/* Wrap the component using useSearchParams in Suspense */}
      <Suspense fallback={null}>
        <GTMPageViewTracker />
      </Suspense>
    </>
  );
}
