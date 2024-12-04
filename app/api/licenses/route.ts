import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LicenseType, LicenseStatus } from "@prisma/client";

// Fonction utilitaire pour valider les données
function validateInstallationData(data: any) {
  const errors: string[] = [];

  if (!data.nomPoste) errors.push('Le champ "nomPoste" est requis.');
  if (!data.nomUtilisateur) errors.push('Le champ "nomUtilisateur" est requis.');
  if (!data.organisation) errors.push('Le champ "organisation" est requis.');
  if (!data.numeroFacture) errors.push('Le champ "numeroFacture" est requis.');
  if (!data.dateFacture) errors.push('Le champ "dateFacture" est requis.');
  
  if (!data.licenses || !data.licenses.length) {
    errors.push('Au moins une licence est requise.');
  } else {
    data.licenses.forEach((license: any, index: number) => {
      if (!license.typeLicense) errors.push(`Le type de licence ${index + 1} est requis.`);
    });
  }

  return { valid: errors.length === 0, errors };
}

// Méthode GET pour récupérer toutes les installations avec leurs licences
export async function GET() {
  try {
    const installations = await prisma.installation_License.findMany({
      include: {
        licenses: {
          select: {
            id: true,
            typeLicense: true,
            status: true,
            description: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    return NextResponse.json(installations);
  } catch (error) {
    console.error("Erreur lors de la récupération des installations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des installations" },
      { status: 500 }
    );
  }
}

// Méthode POST pour créer une nouvelle installation avec ses licences
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomPoste, nomUtilisateur, organisation, numeroFacture, dateFacture, licenses } = body;

    // Validation des données reçues
    const validation = validateInstallationData(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
    }

    const installation = await prisma.installation_License.create({
      data: {
        nomPoste,
        nomUtilisateur,
        organisation,
        numeroFacture,
        dateFacture: new Date(dateFacture),
        licenses: {
          create: licenses.map((license: any) => ({
            typeLicense: license.typeLicense as LicenseType,
            description: license.description || null,
            status: LicenseStatus.INSTALLEE
          }))
        }
      },
      include: {
        licenses: true
      }
    });

    return NextResponse.json(installation);
  } catch (error) {
    console.error("Erreur lors de la création de l'installation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'installation" },
      { status: 500 }
    );
  }
}