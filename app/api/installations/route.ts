import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Materiel {
  marque: string;
  modele: string;
  numeroSerie: string;
  typeMateriel: string;
  dateInstallation: string;
}

interface InstallationData {
  nom: string;
  client: string;
  boutique: string;
  organisation?: string;
  numeroFacture?: string;
  dateFacture?: string;
  materiels: Materiel[];
}

function convertDateFormat(dateString: string): string {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Méthode GET pour récupérer toutes les installations
export async function GET(req: Request) {
  try {
    const installations = await prisma.installation.findMany({
      include: {
        materiels: true,
      },
    });
    return NextResponse.json(installations, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des installations:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des installations' }, { status: 500 });
  }
}

// Méthode POST pour créer une nouvelle installation
export async function POST(req: Request) {
  try {
    const data = await req.json() as InstallationData;

    console.log('Données reçues:', data);

    // Validation des données reçues
    if (!data || !data.nom || !data.client || !data.boutique || !data.materiels || !Array.isArray(data.materiels)) {
      return NextResponse.json({ error: 'Données manquantes ou incorrectes' }, { status: 400 });
    }

    // Validation supplémentaire pour la date d'installation
    for (const materiel of data.materiels) {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(materiel.dateInstallation)) {
        return NextResponse.json({ error: 'Format de date d\'installation invalide. Utilisez DD/MM/YYYY.' }, { status: 400 });
      }
    }

    // Validation de la date de facture si elle est fournie
    if (data.dateFacture && !/^\d{4}-\d{2}-\d{2}$/.test(data.dateFacture)) {
      return NextResponse.json({ error: 'Format de date de facture invalide. Utilisez YYYY-MM-DD.' }, { status: 400 });
    }

    // Création de l'installation dans la base de données
    const newInstallation = await prisma.installation.create({
      data: {
        nom: data.nom,
        client: data.client,
        boutique: data.boutique,
        organisation: data.organisation || '',
        numeroFacture: data.numeroFacture,
        dateFacture: data.dateFacture ? new Date(data.dateFacture) : null,
        status: 'ACTIVE',
        materiels: {
          create: data.materiels.map((materiel) => ({
            marque: materiel.marque,
            modele: materiel.modele,
            numeroSerie: materiel.numeroSerie,
            typeMateriel: materiel.typeMateriel,
            dateInstallation: new Date(convertDateFormat(materiel.dateInstallation)),
          })),
        },
      },
      include: {
        materiels: true,
      },
    });

    return NextResponse.json(newInstallation, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'installation:', error.message || error);
    
    return NextResponse.json({
      error: 'Erreur lors de la création de l\'installation',
      details: (error instanceof Error) ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}