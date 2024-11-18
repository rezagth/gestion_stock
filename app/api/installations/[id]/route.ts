import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Supprimez d'abord les matériels associés à l'installation
    await prisma.materiel.deleteMany({
      where: { installationId: id }, // Assurez-vous que cette clé étrangère est correcte
    });

    // Ensuite, supprimez l'installation
    const deletedInstallation = await prisma.installation.delete({
      where: { id },
    });

    // Retournez une réponse JSON si l'opération de suppression est réussie
    return NextResponse.json({ message: 'Installation et matériels supprimés avec succès', deletedInstallation });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'installation et des matériels:', error);

    // Assurez-vous de retourner un objet JSON même en cas d'erreur
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'installation et des matériels' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const data = await request.json();

    const updatedInstallation = await prisma.installation.update({
      where: { id },
      data: {
        nom: data.nom,
        client: data.client,
        boutique: data.boutique,
        organisation: data.organisation,
        numeroFacture: data.numeroFacture,
        dateFacture: data.dateFacture ? new Date(data.dateFacture) : null,
        status: data.status,
        materiels: {
          deleteMany: {}, // Supprime tous les matériels existants
          create: data.materiels.map((materiel: any) => ({
            marque: materiel.marque,
            modele: materiel.modele,
            numeroSerie: materiel.numeroSerie,
            typeMateriel: materiel.typeMateriel,
            dateInstallation: new Date(materiel.dateInstallation),
          })),
        },
      },
      include: { materiels: true },
    });

    return NextResponse.json(updatedInstallation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'installation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'installation' },
      { status: 500 }
    );
  }
}
