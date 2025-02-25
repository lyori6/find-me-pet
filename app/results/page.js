import ResultsClient from './ResultsClient';

export default function ResultsPage({ searchParams }) {
  const zipCode = searchParams?.zipCode;
  
  return (
    <div className="min-h-screen bg-[url('/subtle-pattern.png')] bg-repeat bg-opacity-5">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Adoptable Pets Near You</h1>
        <p className="text-xl text-muted-foreground mb-8">Find your perfect companion in {zipCode ? `the ${zipCode} area` : 'your area'}</p>
        <ResultsClient initialZipCode={zipCode} />
      </div>
    </div>
  );
}
