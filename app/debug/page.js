'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { debugPetData } from '../utils/petDataStorage';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  
  useEffect(() => {
    const data = debugPetData();
    setDebugInfo(data);
    setSearchParams(Object.fromEntries(new URLSearchParams(window.location.search)));
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl mb-2">localStorage Data:</h2>
        <pre className="bg-white p-2 rounded overflow-auto max-h-96">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4">
        <h2 className="text-xl mb-2">URL Parameters:</h2>
        <pre className="bg-white p-2 rounded">
          {JSON.stringify(searchParams, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4 flex space-x-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear localStorage
        </button>
      </div>
    </div>
  );
}