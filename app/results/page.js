import ResultsClient from './ResultsClient';

export default function ResultsPage({ searchParams }) {
  const zipCode = searchParams?.zipCode;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Adoptable Pets Near You</h1>
      <ResultsClient initialZipCode={zipCode} />
    </div>
  );
}
