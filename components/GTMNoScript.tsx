'use client';

import { useEffect, useState } from 'react';

// Your GTM ID
const GTM_ID = 'GTM-K9XW5SRP';

export default function GTMNoScript() {
  // Using state and useEffect to ensure this only renders on the client
  // to avoid hydration errors
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render when mounted (client-side) to prevent hydration errors
  if (!mounted) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="gtm"
      />
    </noscript>
  );
}
