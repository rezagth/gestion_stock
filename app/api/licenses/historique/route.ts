import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get('installationId');

    const query = {
      where: installationId ? {
        installationLicenseId: parseInt(installationId)
      } : undefined,
      include: {
        license: {
          select: {
            typeLicense: true,
            status: true,
            description: true
          }
        },
        installationLicense: {
          select: {
            organisation: true,
            numeroFacture: true,
            dateFacture: true
          }
        }
      },
      orderBy: {
        dateRemplacement: 'desc'
      }
    };

    const remplacements = await prisma.remplacement_License.findMany(query);

    const formattedRemplacements = remplacements.map(remplacement => ({
      id: remplacement.id,
      dateRemplacement: remplacement.dateRemplacement,
      ancienNomPoste: remplacement.ancienNomPoste,
      nouveauNomPoste: remplacement.nouveauNomPoste,
      ancienNomUtilisateur: remplacement.ancienNomUtilisateur,
      nouveauNomUtilisateur: remplacement.nouveauNomUtilisateur,
      motif: remplacement.motif,
      license: {
        typeLicense: remplacement.license.typeLicense,
        status: remplacement.license.status,
        description: remplacement.license.description
      },
      installation: {
        organisation: remplacement.installation_License.organisation,
        numeroFacture: remplacement.installation_License.numeroFacture,
        dateFacture: remplacement.installation_License.dateFacture
      }
    }));

    return NextResponse.json(formattedRemplacements);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}