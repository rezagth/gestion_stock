import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const includeReplacement = searchParams.get('include') === 'replacement';

  console.log('API Call - GET /api/materiels/[id]');
  console.log('ID:', id);
  console.log('Include Replacement:', includeReplacement);

  if (!id) {
    console.log('Error: Missing ID');
    return NextResponse.json({ error: 'ID du matériel manquant' }, { status: 400 });
  }

  try {
    if (includeReplacement) {
      console.log('Searching for replacement material');
      // Rechercher le matériel de remplacement
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

      console.log('Found replacement:', remplacement);

      if (!remplacement) {
        console.log('No replacement found');
        return NextResponse.json(
          { error: 'Aucun matériel de remplacement trouvé' },
          { status: 404 }
        );
      }

      console.log('Returning replacement material:', remplacement.nouveauMateriel);
      return NextResponse.json(remplacement.nouveauMateriel);
    } else {
      // Recherche standard du matériel
      console.log('Standard material search');
      const materiel = await prisma.materiel.findUnique({
        where: { id },
        include: {
          installation: true,
          remplacementsPrecedents: {
            include: {
              nouveauMateriel: true
            }
          },
          remplacementsSuivants: {
            include: {
              ancienMateriel: true
            }
          }
        }
      });

      if (!materiel) {
        console.log('Material not found');
        return NextResponse.json(
          { error: 'Matériel non trouvé' },
          { status: 404 }
        );
      }

      console.log('Returning standard material');
      return NextResponse.json(materiel);
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID du matériel manquant' }, { status: 400 });
  }

  try {
    // 1. Vérifier si le matériel existe et récupérer ses relations
    const materiel = await prisma.materiel.findUnique({
      where: { id },
      include: {
        remplacementsPrecedents: true,
        remplacementsSuivants: true,
        materielsRemplacants: true,
      }
    });

    if (!materiel) {
      return NextResponse.json({ error: 'Matériel non trouvé' }, { status: 404 });
    }

    // 2. Supprimer d'abord les relations de remplacement
    if (materiel.remplacementsPrecedents.length > 0 || 
        materiel.remplacementsSuivants.length > 0 || 
        materiel.materielsRemplacants.length > 0) {
      
      // Supprimer les remplacements précédents
      await prisma.remplacement.deleteMany({
        where: {
          OR: [
            { ancienMaterielId: id },
            { nouveauMaterielId: id }
          ]
        }
      });

      // Mettre à jour les références des matériels remplaçants
      await prisma.materiel.updateMany({
        where: { materielRemplaceId: id },
        data: { materielRemplaceId: null }
      });
    }

    // 3. Maintenant on peut supprimer le matériel
    await prisma.materiel.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Matériel et ses relations supprimés avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du matériel:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression du matériel',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}