import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
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
          updateMany: data.materiels.map((materiel: any) => ({
            where: { id: materiel.id },
            data: {
              marque: materiel.marque,
              modele: materiel.modele,
              numeroSerie: materiel.numeroSerie,
              typeMateriel: materiel.typeMateriel,
              dateInstallation: new Date(materiel.dateInstallation),
            },
          })),
        },
      },
      include: { materiels: true },
    });

    return NextResponse.json(updatedInstallation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'installation:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'installation' }, { status: 500 });
  }
}