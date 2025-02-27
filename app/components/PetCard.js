'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PetImagePlaceholder from './PetImagePlaceholder';
import { decodeHtmlEntities } from '../utils/textUtils';

export default function PetCard({ pet, isTopMatch }) {
  // Handle missing data gracefully
  const name = pet?.name || 'Unknown';
  const photos = pet?.photos || [];
  const primaryPhoto = photos.length > 0 ? photos[0].medium : null;
  const breed = pet?.breeds?.primary || 'Unknown breed';
  const age = pet?.age || 'Unknown age';
  const gender = pet?.gender || 'Unknown gender';
  const distance = pet?.distance ? `${Math.round(pet.distance)} miles away` : 'Distance unknown';
  
  // Ensure description is decoded
  let decodedDescription = '';
  if (pet?.description) {
    // First decode HTML entities (handles both single and double-encoded entities)
    decodedDescription = decodeHtmlEntities(pet.description);
    // Then truncate if needed
    if (decodedDescription.length > 100) {
      decodedDescription = `${decodedDescription.substring(0, 100)}...`;
    }
    // Log for debugging
    console.log('Original:', pet.description);
    console.log('Decoded:', decodedDescription);
  } else {
    decodedDescription = 'No description available';
  }

  return (
    <motion.div 
      className={`bg-white rounded-3xl overflow-hidden flex flex-col hover:cursor-pointer h-full 
                 ${isTopMatch ? 'relative shadow-lg' : 'shadow-lg border border-gray-100'}`}
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
      transition={{ duration: 0.3 }}
    >
      {isTopMatch && (
        <>
          {/* Simple, more visible border */}
          <div 
            className="absolute -inset-[2px] rounded-[24px] z-0" 
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              opacity: 0.8
            }}
          />
          
          {/* Clean white space between border and card */}
          <div className="absolute -inset-[1px] bg-white rounded-[23px] z-[1]" />
          
          {/* Improved badge - more iOS-like with better feel */}
          <div className="absolute top-3 right-3 z-20">
            <div 
              className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-base font-medium shadow-sm flex items-center gap-1.5"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Top Match</span>
            </div>
          </div>
        </>
      )}
      
      <Link href={`/pet/${pet.id}`} className={`flex flex-col h-full relative ${isTopMatch ? 'z-10' : ''}`}>
        <div className="relative bg-muted aspect-[4/3] overflow-hidden">
          {/* Display only photo, video handling removed */}
          {primaryPhoto ? (
            <div className="absolute inset-0 transform transition-transform duration-500 hover:scale-110">
              <Image
                src={primaryPhoto}
                alt={`Photo of ${name}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center"
                priority
              />
            </div>
          ) : (
            <PetImagePlaceholder />
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex-grow space-y-3">
            <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
            <p className="text-muted-foreground font-medium">{breed}</p>
            
            <div className="flex flex-wrap gap-2 my-3">
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {age}
              </span>
              <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                {gender}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mt-3">{decodedDescription}</p>
            
            <p className="text-sm text-muted-foreground flex items-center mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {distance}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
