import FilteredResultsClient from './FilteredResultsClient';

export default function FilteredResultsPage({ searchParams }) {
  const zipCode = searchParams?.zipCode;
  
  return (
    <div className="min-h-screen bg-[url('/subtle-pattern.png')] bg-repeat bg-opacity-5">
      <div className="container mx-auto px-6 sm:px-10 pt-36 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
          Filter Pet Results
        </h1>
        <p className="text-base sm:text-xl text-gray-500 mb-10">Find and filter pets {zipCode ? `in the ${zipCode} area` : 'in your area'}</p>
        <FilteredResultsClient initialZipCode={zipCode} />
      </div>
    </div>
  );
}
