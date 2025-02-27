'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/gtm';

export default function GTMTestPage() {
  useEffect(() => {
    // Track page visit when the component mounts
    trackEvent('gtm_test_page_visit', {
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleTestEvent = () => {
    trackEvent('gtm_test_button_click', {
      buttonId: 'test-event-button',
      timestamp: new Date().toISOString(),
    });
    alert('Test event sent to Google Tag Manager!');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Google Tag Manager Test Page</h1>
      
      <div className="p-4 border rounded-md bg-slate-50">
        <h2 className="text-xl font-semibold mb-4">GTM Status</h2>
        
        <div className="space-y-2">
          <GTMStatusChecker />
        </div>
      </div>
      
      <div className="p-4 border rounded-md bg-slate-50">
        <h2 className="text-xl font-semibold mb-4">Test GTM Event</h2>
        <button
          onClick={handleTestEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Send Test Event
        </button>
        <p className="mt-2 text-sm text-gray-600">
          Click this button to send a test event to Google Tag Manager
        </p>
      </div>

      <div className="p-4 border rounded-md bg-slate-50">
        <h2 className="text-xl font-semibold mb-4">GTM Debug Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open Chrome DevTools (F12 or right-click &gt; Inspect)</li>
          <li>Go to the Network tab</li>
          <li>Filter for "gtm" to see if gtm.js is loading</li>
          <li>Check the Console for any GTM errors</li>
          <li>Visit <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Tag Manager</a> and use Preview mode with your container ID</li>
        </ol>
      </div>
    </div>
  );
}

// Component to check if GTM is loaded
function GTMStatusChecker() {
  const [status, setStatus] = React.useState<'checking' | 'loaded' | 'not-loaded'>('checking');
  const [dataLayerExists, setDataLayerExists] = React.useState<boolean>(false);
  const [dataLayerEvents, setDataLayerEvents] = React.useState<number>(0);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // Check if dataLayer exists
      if (window.dataLayer) {
        setDataLayerExists(true);
        setDataLayerEvents(window.dataLayer.length);
      }
      
      // Check if GTM is loaded
      if (window.google_tag_manager && window.google_tag_manager['GTM-K9XW5SRP']) {
        setStatus('loaded');
      } else {
        setStatus('not-loaded');
        
        // Check again after a delay in case it's still loading
        const timeoutId = setTimeout(() => {
          if (window.google_tag_manager && window.google_tag_manager['GTM-K9XW5SRP']) {
            setStatus('loaded');
          }
        }, 2000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <span className="font-medium">GTM Status: </span>
        {status === 'checking' && <span className="text-yellow-600">Checking...</span>}
        {status === 'loaded' && <span className="text-green-600">✓ Loaded</span>}
        {status === 'not-loaded' && <span className="text-red-600">✗ Not Loaded</span>}
      </div>
      
      <div>
        <span className="font-medium">dataLayer Exists: </span>
        {dataLayerExists ? (
          <span className="text-green-600">✓ Yes</span>
        ) : (
          <span className="text-red-600">✗ No</span>
        )}
      </div>
      
      <div>
        <span className="font-medium">dataLayer Events: </span>
        <span>{dataLayerEvents}</span>
      </div>
    </div>
  );
}

import React from 'react';
