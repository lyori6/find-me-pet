import PetDetailsClient from './PetDetailsClient';

export const dynamic = 'force-dynamic';

export default function PetDetailsPage({ params }) {
  return (
    <div className="min-h-screen">
      <PetDetailsClient petId={params.id} />
    </div>
  );
}
