'use client';

import { getZipCode } from '../utils/storage';
import FilteredResultsClient from '../filtered-results/FilteredResultsClient';

export default function AltResultsPage({ searchParams }) {
  const zipCode = searchParams?.zipCode || getZipCode();

  return (
    <div className="min-h-screen bg-[url('/subtle-pattern.png')] bg-repeat bg-opacity-5">
      <div className="container mx-auto px-6 sm:px-10 pt-28 pb-20">
        {/* Spacer div to create visible space */}
        <div className="h-8 w-full bg-transparent"></div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
          Alternative Pet Results
        </h1>
        <p className="text-base sm:text-xl text-gray-500 mb-10">Find and filter pets {zipCode ? `in the ${zipCode} area` : 'in your area'}</p>
        <FilteredResultsClient initialZipCode={zipCode} />
      </div>
    </div>
  );
}
