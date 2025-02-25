import PetDetailsClient from './PetDetailsClient';

export default function PetDetailsPage({ params }) {
  const { id } = params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PetDetailsClient petId={id} />
    </div>
  );
}
