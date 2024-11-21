import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Supprimez d'abord les remplacements associés à l'installation
    await prisma.remplacement.deleteMany({
      where: { installationId: id },
    });

    // Ensuite, supprimez les matériels associés à l'installation
    await prisma.materiel.deleteMany({
      where: { installationId: id },
    });

    // Enfin, supprimez l'installation
    const deletedInstallation = await prisma.installation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Installation, matériels et remplacements supprimés avec succès', deletedInstallation });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'installation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'installation', details: error },
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

    // Récupérez l'installation existante avec ses matériels
    const existingInstallation = await prisma.installation.findUnique({
      where: { id },
      include: { materiels: true },
    });

    if (!existingInstallation) {
      return NextResponse.json({ error: 'Installation non trouvée' }, { status: 404 });
    }

    // Mettez à jour l'installation
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
          // Au lieu de supprimer tous les matériels, mettez à jour ceux qui existent déjà
          // et créez de nouveaux matériels si nécessaire
          upsert: data.materiels.map((materiel: any) => ({
            where: {
              id: materiel.id || 'new-id-' + Math.random().toString(36).substr(2, 9),
            },
            update: {
              marque: materiel.marque,
              modele: materiel.modele,
              numeroSerie: materiel.numeroSerie,
              typeMateriel: materiel.typeMateriel,
              dateInstallation: new Date(materiel.dateInstallation),
              status: materiel.status,
            },
            create: {
              marque: materiel.marque,
              modele: materiel.modele,
              numeroSerie: materiel.numeroSerie,
              typeMateriel: materiel.typeMateriel,
              dateInstallation: new Date(materiel.dateInstallation),
              status: materiel.status,
            },
          })),
        },
      },
      include: { materiels: true },
    });

    return NextResponse.json(updatedInstallation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'installation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'installation', details: error },
      { status: 500 }
    );
  }
}
