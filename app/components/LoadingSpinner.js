'use client';

import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component that displays a spinning animation
 * with optional text. Uses inline styles for the animation to ensure it works
 * regardless of Tailwind configuration.
 * 
 * @param {Object} props
 * @param {string} props.size - Size of the spinner: 'small', 'default', or 'large'
 * @param {string|null} props.text - Optional text to display with the spinner
 * @param {string} props.textPosition - Position of the text: 'top', 'bottom', 'left', or 'right'
 * @returns {JSX.Element} The rendered loading spinner
 */
export default function LoadingSpinner({ 
  size = 'default', 
  text = null,
  textPosition = 'bottom'
}) {
  // Size values in pixels
  const sizeValues = {
    small: { outer: 32, border: 2 },
    default: { outer: 64, border: 4 },
    large: { outer: 96, border: 4 },
  };
  
  // Text size classes
  const textSizeMap = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
  };
  
  // Get the appropriate sizes
  const spinnerSize = sizeValues[size] || sizeValues.default;
  const textSize = textSizeMap[size] || textSizeMap.default;
  
  // Spinner colors - using the primary and secondary colors from the design system
  const primaryColor = '#f47c7c'; // Red-ish from the design system
  const secondaryColor = '#4ecdc4'; // Teal-ish from the design system
  
  // Inline styles for the spinner
  const spinnerContainerStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  
  const outerRingStyle = {
    width: `${spinnerSize.outer}px`,
    height: `${spinnerSize.outer}px`,
    borderRadius: '50%',
    border: `${spinnerSize.border}px solid #e2e8f0`,
    opacity: 0.25,
    position: 'absolute',
  };
  
  const spinningRingStyle = {
    width: `${spinnerSize.outer}px`,
    height: `${spinnerSize.outer}px`,
    borderRadius: '50%',
    borderWidth: `${spinnerSize.border}px`,
    borderStyle: 'solid',
    borderTopColor: primaryColor,
    borderRightColor: secondaryColor,
    borderBottomColor: secondaryColor,
    borderLeftColor: primaryColor,
    display: 'block',
  };
  
  // Create the spinner component
  const SpinnerElement = () => (
    <div style={spinnerContainerStyle}>
      {/* Static outer ring */}
      <div style={outerRingStyle}></div>
      
      {/* Spinning inner ring - using inline styles for the animation */}
      <div 
        className="spinner-element"
        style={spinningRingStyle}
      ></div>
      
      {/* Add keyframes for the animation directly in the component */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-element {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
  
  // Container styles for different text positions
  const getContainerStyle = () => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    };
    
    if (textPosition === 'top' || textPosition === 'bottom') {
      return {
        ...baseStyle,
        flexDirection: 'column',
      };
    }
    
    return {
      ...baseStyle,
      flexDirection: textPosition === 'left' ? 'row-reverse' : 'row',
    };
  };
  
  // Text style
  const textStyle = {
    color: '#4b5563',
    fontWeight: 500,
    fontSize: textPosition === 'small' ? '0.875rem' : textPosition === 'large' ? '1.125rem' : '1rem',
  };
  
  // Render the component with the appropriate text position
  return (
    <div style={getContainerStyle()}>
      {textPosition === 'top' && text && (
        <p style={textStyle}>{text}</p>
      )}
      
      <SpinnerElement />
      
      {(textPosition === 'bottom' || textPosition === 'right' || textPosition === 'left') && text && (
        <p style={textStyle}>{text}</p>
      )}
    </div>
  );
}
