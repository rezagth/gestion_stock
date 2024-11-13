import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const prisma = new PrismaClient();

// Fonction utilitaire pour formater les dates en français
const formatDateToFrench = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

// GET : Récupérer tous les matériels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const materiels = await prisma.materiel.findMany({
      where: search ? {
        OR: [
          { marque: { contains: search, mode: 'insensitive' } },
          { modele: { contains: search, mode: 'insensitive' } },
          { numeroSerie: { contains: search, mode: 'insensitive' } },
          { typeMateriel: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: { installation: true },
    });

    return NextResponse.json(materiels.length ? materiels : [], {
      status: materiels.length ? 200 : 404
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des matériels' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST : Créer un nouveau matériel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Vérifiez que le corps contient toutes les informations nécessaires
    if (!body.marque || !body.modele || !body.numeroSerie || !body.typeMateriel || !body.dateInstallation || !body.installationId) {
      return NextResponse.json({ error: 'Informations manquantes dans la requête' }, { status: 400 });
    }

    // Utilisez directement l'objet Date sans formater
    const materiel = await prisma.materiel.create({
      data: {
        marque: body.marque,
        modele: body.modele,
        numeroSerie: body.numeroSerie,
        typeMateriel: body.typeMateriel,
        dateInstallation: new Date(body.dateInstallation), // Utilisation directe ici
        installationId: body.installationId,
      },
      include: { installation: true }
    });

    return NextResponse.json(materiel);
  } catch (error) {
    console.error('Erreur lors de la création du matériel:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du matériel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT : Mettre à jour un matériel existant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.marque || !body.modele || !body.numeroSerie || !body.typeMateriel || !body.dateInstallation || !body.installationId) {
      return NextResponse.json({ error: 'Informations manquantes dans la requête' }, { status: 400 });
    }

    // Utilisez directement l'objet Date sans formater
    const materiel = await prisma.materiel.update({
      where: { id: body.id },
      data: {
        marque: body.marque,
        modele: body.modele,
        numeroSerie: body.numeroSerie,
        typeMateriel: body.typeMateriel,
        dateInstallation: new Date(body.dateInstallation), // Utilisation directe ici
        installationId: body.installationId,
      },
      include: { installation: true }
    });

    return NextResponse.json(materiel);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du matériel:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du matériel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE : Supprimer un matériel
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.materiel.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Matériel supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du matériel:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du matériel' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}