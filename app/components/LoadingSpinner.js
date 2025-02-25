'use client';

import React from 'react';

export default function LoadingSpinner({ size = 'default' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div 
        className={`${sizeClasses[size] || sizeClasses.default} border-4 border-primary border-t-transparent rounded-full animate-spin`}
        aria-label="Loading"
      />
    </div>
  );
}
