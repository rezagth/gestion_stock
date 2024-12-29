import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  console.log('API Call - GET /api/materiel-replacement/[id]');
  console.log('ID:', id);

  if (!id) {
    return NextResponse.json({ error: 'ID du matériel manquant' }, { status: 400 });
  }

  try {
    // Rechercher uniquement le matériel de remplacement
    const remplacement = await prisma.remplacement.findFirst({
      where: {
        ancienMaterielId: id
      },
      select: {
        nouveauMateriel: {
          select: {
            id: true,
            marque: true,
            modele: true,
            numeroSerie: true,
            typeMateriel: true,
            dateInstallation: true,
            status: true
          }
        }
      }
    });

    if (!remplacement || !remplacement.nouveauMateriel) {
      return NextResponse.json(
        { error: 'Aucun matériel de remplacement trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(remplacement.nouveauMateriel);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
