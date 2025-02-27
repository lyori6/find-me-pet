'use client';

import { getZipCode } from '../utils/storage';
import FilteredResultsClient from '../filtered-results/FilteredResultsClient';

export default function AltResultsPage({ searchParams }) {
  const zipCode = searchParams?.zipCode || getZipCode();

  return (
    <div className="min-h-screen bg-[url('/subtle-pattern.png')] bg-repeat bg-opacity-5">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Alternative Pet Results</h1>
        <p className="text-xl text-muted-foreground mb-8">Find and filter pets {zipCode ? `in the ${zipCode} area` : 'in your area'}</p>
        <FilteredResultsClient initialZipCode={zipCode} />
      </div>
    </div>
  );
}
