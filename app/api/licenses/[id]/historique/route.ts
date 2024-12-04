import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const licenseId = params.id;

    // Récupérer la licence avec ses remplacements
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        installation: true,
        remplacements: {
          include: {
            license: true,
            installationLicense: true
          },
          orderBy: {
            dateRemplacement: 'desc'
          }
        }
      }
    });

    if (!license) {
      return NextResponse.json(
        { error: "License non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer tous les remplacements liés à cette licence
    const allRemplacements = await prisma.remplacement_License.findMany({
      where: {
        OR: [
          { licenseId: licenseId },
          { 
            AND: [
              { nouveauNomPoste: license.installation.nomPoste },
              { nouveauNomUtilisateur: license.installation.nomUtilisateur }
            ]
          }
        ]
      },
      include: {
        license: true,
        installationLicense: true
      },
      orderBy: {
        dateRemplacement: 'desc'
      }
    });

    return NextResponse.json({
      license,
      remplacements: allRemplacements
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
