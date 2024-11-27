import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface License {
  typeLicense: string;
  description?: string;
}

interface InstallationData {
  nomPoste: string;
  nomUtilisateur: string;
  numeroFacture: string;
  dateFacture: string;
  licenses: License[];
}

// Fonction utilitaire pour valider les données
function validateInstallationData(data: InstallationData) {
  const errors: string[] = [];

  if (!data.nomPoste) errors.push('Le champ "nomPoste" est requis.');
  if (!data.nomUtilisateur) errors.push('Le champ "nomUtilisateur" est requis.');
  if (!data.numeroFacture) errors.push('Le champ "numeroFacture" est requis.');
  if (!data.dateFacture) errors.push('Le champ "dateFacture" est requis.');
  
  if (!Array.isArray(data.licenses) || data.licenses.length === 0) {
    errors.push('Au moins une licence doit être fournie.');
  } else {
    data.licenses.forEach((license, index) => {
      if (!license.typeLicense) {
        errors.push(`Le champ "typeLicense" est requis pour la licence ${index + 1}.`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// Méthode GET pour récupérer toutes les installations avec leurs licences
export async function GET(req: Request) {
  try {
    const installations = await prisma.installation_License.findMany({
      include: { licenses: true },
    });
    return NextResponse.json(installations, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des installations:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des installations' }, { status: 500 });
  }
}

// Méthode POST pour créer une nouvelle installation avec ses licences
export async function POST(req: Request) {
  try {
    const data = await req.json() as InstallationData;

    // Validation des données reçues
    const validation = validateInstallationData(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
    }

    // Création de l'installation dans la base de données
    const installation = await prisma.installation_License.create({
      data: {
        nomPoste: data.nomPoste,
        nomUtilisateur: data.nomUtilisateur,
        numeroFacture: data.numeroFacture,
        dateFacture: new Date(data.dateFacture),
        licenses: {
          create: data.licenses.map((license) => ({
            typeLicense: license.typeLicense,
            description: license.description || '',
          })),
        },
      },
      include: { licenses: true },
    });

    return NextResponse.json(installation, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'installation:', error.message || error);
    return NextResponse.json({
      error: 'Erreur lors de la création de l\'installation',
      details: (error instanceof Error) ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}