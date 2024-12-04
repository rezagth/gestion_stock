// app/api/licenses/remplacements/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseId, changePoste, changeUtilisateur, nouveauNomPoste, nouveauNomUtilisateur, motif } = body;

    if (!licenseId) {
      return NextResponse.json({ error: "ID de licence manquant" }, { status: 400 });
    }

    // Récupérer la licence avec son installation
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        installation: true,
        remplacements: {
          orderBy: {
            dateRemplacement: 'desc'
          },
          take: 1
        }
      }
    });

    if (!license) {
      return NextResponse.json({ error: "Licence non trouvée" }, { status: 404 });
    }

    // Vérifier si la licence peut être remplacée
    if (license.status === "INACTIVE") {
      return NextResponse.json({ error: "Cette licence ne peut pas être remplacée car elle est inactive" }, { status: 400 });
    }

    // Créer l'entrée dans l'historique des remplacements
    const remplacement = await prisma.remplacement_License.create({
      data: {
        license: {
          connect: { id: licenseId }
        },
        installationLicense: {
          connect: { id: license.installationId }
        },
        ancienNomPoste: license.installation.nomPoste,
        nouveauNomPoste: changePoste ? nouveauNomPoste : license.installation.nomPoste,
        ancienNomUtilisateur: license.installation.nomUtilisateur,
        nouveauNomUtilisateur: changeUtilisateur ? nouveauNomUtilisateur : license.installation.nomUtilisateur,
        motif: motif || undefined
      }
    });

    // Mettre à jour l'installation si nécessaire
    if (changePoste || changeUtilisateur) {
      await prisma.installation_License.update({
        where: { id: license.installationId },
        data: {
          ...(changePoste && { nomPoste: nouveauNomPoste }),
          ...(changeUtilisateur && { nomUtilisateur: nouveauNomUtilisateur })
        }
      });
    }

    // Mettre à jour le statut de la licence
    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: {
        status: "REMPLACEE"
      }
    });

    // Récupérer l'installation mise à jour avec toutes les licences
    const updatedInstallation = await prisma.installation_License.findUnique({
      where: { id: license.installationId },
      include: {
        licenses: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Remplacement effectué avec succès",
      remplacement,
      installation: updatedInstallation,
      license: updatedLicense
    });

  } catch (error) {
    console.error("Erreur lors du remplacement de la licence:", error);
    return NextResponse.json(
      { error: "Erreur lors du remplacement de la licence" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const remplacements = await prisma.remplacement_License.findMany({
      include: {
        license: {
          select: {
            id: true,
            typeLicense: true,
            status: true,
            description: true,
            createdAt: true
          }
        },
        installationLicense: {
          select: {
            id: true,
            nomPoste: true,
            nomUtilisateur: true,
            organisation: true,
            numeroFacture: true,
            dateFacture: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        {
          dateRemplacement: 'desc'
        }
      ]
    });

    if (!remplacements) {
      return NextResponse.json([], { status: 200 });
    }

    // Formater les données pour une meilleure lisibilité
    const formattedRemplacements = remplacements.map(remplacement => ({
      id: remplacement.id,
      dateRemplacement: remplacement.dateRemplacement,
      ancienNomPoste: remplacement.ancienNomPoste,
      nouveauNomPoste: remplacement.nouveauNomPoste,
      ancienNomUtilisateur: remplacement.ancienNomUtilisateur,
      nouveauNomUtilisateur: remplacement.nouveauNomUtilisateur,
      motif: remplacement.motif,
      license: {
        id: remplacement.license?.id,
        typeLicense: remplacement.license?.typeLicense,
        status: remplacement.license?.status,
        description: remplacement.license?.description,
        createdAt: remplacement.license?.createdAt
      },
      installation: remplacement.installationLicense ? {
        id: remplacement.installationLicense.id,
        nomPoste: remplacement.installationLicense.nomPoste,
        nomUtilisateur: remplacement.installationLicense.nomUtilisateur,
        organisation: remplacement.installationLicense.organisation,
        numeroFacture: remplacement.installationLicense.numeroFacture,
        dateFacture: remplacement.installationLicense.dateFacture,
        createdAt: remplacement.installationLicense.createdAt
      } : null
    }));

    console.log('Remplacements trouvés:', formattedRemplacements.length);
    return NextResponse.json(formattedRemplacements);
  } catch (error) {
    console.error("Erreur lors de la récupération des remplacements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des remplacements" },
      { status: 500 }
    );
  }
}