import { notFound } from 'next/navigation';
import { prisma} from '@/lib/prisma';
import EditInstallationForm from './EditInstallationForm';

export default async function EditInstallationPage({ params }: { params: { id: string } }) {
  const installation = await prisma.installation.findUnique({
    where: { id: parseInt(params.id) },
    include: { materiels: true },
  });

  if (!installation) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modifier l'installation</h1>
      <EditInstallationForm installation={installation} />
    </div>
  );
}