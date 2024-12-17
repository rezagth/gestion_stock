import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID du matériel manquant' }, { status: 400 });
  }

  try {
    const materiel = await prisma.materiel.findUnique({
      where: { id },
      include: {
        installation: true,
        materielRemplace: true,
        remplacementsPrecedents: {
          include: { ancienMateriel: true }
        },
        remplacementsSuivants: {
          include: { nouveauMateriel: true }
        },
      },
    });

    if (!materiel) {
      return NextResponse.json({ error: 'Matériel non trouvé' }, { status: 404 });
    }

    return NextResponse.json(materiel);

  } catch (error) {
    console.error('Erreur lors de la récupération du matériel:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du matériel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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