import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

    if (!data || !data.nom || !data.client || !data.boutique || !data.materiels || !Array.isArray(data.materiels)) {
      return NextResponse.json({ error: 'Données manquantes ou incorrectes' }, { status: 400 });
    }

    // Formatage des dates pour assurer le format français
    const formatDateToFrench = (date: string) => {
      return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
    };

    const formattedDateFacture = data.dateFacture ? formatDateToFrench(data.dateFacture) : null;
    const formattedMateriels = data.materiels.map((materiel) => ({
      ...materiel,
      dateInstallation: formatDateToFrench(materiel.dateInstallation),
    }));

    // Création de l'installation dans la base de données
    const newInstallation = await prisma.installation.create({
      data: {
        nom: data.nom,
        client: data.client,
        boutique: data.boutique,
        organisation: data.organisation || '',
        numeroFacture: data.numeroFacture,
        dateFacture: formattedDateFacture ? new Date(formattedDateFacture) : null,
        status: 'ACTIVE',
        materiels: {
          create: formattedMateriels.map((materiel) => ({
            marque: materiel.marque,
            modele: materiel.modele,
            numeroSerie: materiel.numeroSerie,
            typeMateriel: materiel.typeMateriel,
            dateInstallation: new Date(materiel.dateInstallation),
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

    return NextResponse.json(
      {
        error: 'Erreur lors de la création de l\'installation',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
