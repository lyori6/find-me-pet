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
    decodedDescription = decodeHtmlEntities(pet.description);
    if (decodedDescription.length > 100) {
      decodedDescription = `${decodedDescription.substring(0, 100)}...`;
    }
  } else {
    decodedDescription = 'No description available';
  }

  return (
    <motion.div 
      className={`bg-white rounded-xl overflow-hidden flex flex-col hover:cursor-pointer h-full w-full max-w-[240px]
                 ${isTopMatch ? 'relative' : ''}`}
      whileHover={{ 
        y: -4,
        boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.06), 0 8px 16px -8px rgba(0, 0, 0, 0.04)',
        scale: 1.02
      }}
      transition={{ 
        duration: 0.15,
        ease: "easeOut"
      }}
      style={{ 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.01)'
      }}
    >
      {isTopMatch && (
        <div className="absolute top-3 right-3 z-20">
          <div 
            className="bg-gradient-to-r from-primary to-secondary text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Top Match</span>
          </div>
        </div>
      )}
      
      <Link href={`/pet/${pet.id}`} className={`flex flex-col h-full`}>
        <div className="relative bg-slate-50 aspect-[4/3] overflow-hidden">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto}
              alt={`Photo of ${name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 240px"
              className="object-cover object-center transition-transform duration-700 ease-out"
              style={{
                transform: 'scale(1.01)'  // Subtle initial scale to avoid pixel gap
              }}
            />
          ) : (
            <PetImagePlaceholder />
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-gray-500 text-sm mb-3">{breed}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {age}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
              {gender}
            </span>
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">{decodedDescription}</p>
          
          <div className="flex items-center text-xs text-gray-400 mt-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {distance}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
