'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PetImagePlaceholder from './PetImagePlaceholder';

export default function PetCard({ pet }) {
  // Handle missing data gracefully
  const name = pet?.name || 'Unknown';
  const photos = pet?.photos || [];
  const videos = pet?.videos || [];
  const hasMedia = photos.length > 0 || videos.length > 0;
  const primaryMedia = videos.length > 0 ? videos[0].embed :
    (photos.length > 0 ? photos[0].medium : null);
  const breed = pet?.breeds?.primary || 'Unknown breed';
  const age = pet?.age || 'Unknown age';
  const gender = pet?.gender || 'Unknown gender';
  const distance = pet?.distance ? `${Math.round(pet.distance)} miles away` : 'Distance unknown';
  const hasVideo = videos.length > 0;

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col hover:cursor-pointer"
      style={{ height: '460px' }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/pet/${pet.id}`} className="flex flex-col h-full">
        <div 
          className="relative bg-muted"
          style={{ height: '260px' }}
        >
          {hasVideo ? (
            <div className="absolute inset-0">
              <div dangerouslySetInnerHTML={{ __html: primaryMedia }} className="w-full h-full" />
              <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Video
              </div>
            </div>
          ) : primaryMedia ? (
            <div className="absolute inset-0">
              <Image
                src={primaryMedia}
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
          <div className="flex-grow">
            <h3 className="text-xl font-semibold mb-2">{name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{breed}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {age}
              </span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                {gender}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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