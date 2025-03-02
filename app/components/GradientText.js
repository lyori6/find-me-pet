'use client';

import React from 'react';

// Styles for the text effect
const primaryTextStyles = `
  .primary-text {
    color: #ef4444; /* Primary color */
    letter-spacing: -0.5px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
`;

/**
 * GradientText Component
 * 
 * A reusable component for displaying text with primary color
 * Name kept as GradientText for backward compatibility
 */
export default function GradientText({ 
  children, 
  animated = true, // Kept for backward compatibility but no longer used
  as = 'span',
  className = '',
  ...props 
}) {
  const Tag = as;
  
  return (
    <>
      <style jsx global>{primaryTextStyles}</style>
      <Tag className={`primary-text ${className}`} {...props}>
        {children}
      </Tag>
    </>
  );
}
