'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Spinner Test Page
 * 
 * This is a simple test page to verify that the loading spinner works correctly.
 * It shows different variations of the LoadingSpinner component.
 */
export default function SpinnerTestPage() {
  const [loading, setLoading] = useState(true);
  const [testNumber, setTestNumber] = useState(1);

  // Simulate loading state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Reset loading state when test number changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [testNumber]);

  return (
    <div className="container mx-auto pt-0 pb-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Loading Spinner Test Page</h1>
      
      <div className="flex flex-col gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setLoading(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start Loading
            </button>
            <button 
              onClick={() => setTestNumber(prev => prev + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Reset Test (Current: {testNumber})
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">LoadingSpinner Component</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner 
                size="large" 
                text="Testing LoadingSpinner component..."
              />
            </div>
          ) : (
            <div className="text-center py-10 text-green-600 font-medium">
              Loading complete! Click "Start Loading" to test again.
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Spinner Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Small</h3>
              <LoadingSpinner size="small" text="Small" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Default</h3>
              <LoadingSpinner size="default" text="Default" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Large</h3>
              <LoadingSpinner size="large" text="Large" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Text Position Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Top</h3>
              <LoadingSpinner size="default" text="Text on top" textPosition="top" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Bottom</h3>
              <LoadingSpinner size="default" text="Text on bottom" textPosition="bottom" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Left</h3>
              <LoadingSpinner size="default" text="Text on left" textPosition="left" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-2">Right</h3>
              <LoadingSpinner size="default" text="Text on right" textPosition="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
