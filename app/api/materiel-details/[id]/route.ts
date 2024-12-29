import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  console.log('API Call - GET /api/materiel-details/[id]');
  console.log('ID:', id);

  if (!id) {
    return NextResponse.json({ error: 'ID du matériel manquant' }, { status: 400 });
  }

  try {
    // Recherche du matériel avec toutes les relations pour la page de détail
    const materiel = await prisma.materiel.findUnique({
      where: { id },
      include: {
        installation: true,
      }
    });

    if (!materiel) {
      return NextResponse.json(
        { error: 'Matériel non trouvé' },
        { status: 404 }
      );
    }

    // Si le matériel est remplacé, chercher son remplaçant
    if (materiel.status === 'REMPLACE') {
      const remplacement = await prisma.remplacement.findFirst({
        where: {
          ancienMaterielId: id
        },
        include: {
          nouveauMateriel: true
        }
      });

      if (remplacement) {
        return NextResponse.json({
          ...materiel,
          materielRemplace: remplacement.nouveauMateriel
        });
      }
    }

    return NextResponse.json(materiel);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
