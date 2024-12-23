import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    console.log("ID reçu dans l'API:", id);

    const installation = await prisma.installation_License.findUnique({
      where: { id },
      include: {
        licenses: true
      }
    });

    if (!installation) {
      console.log("Installation non trouvée pour l'ID:", id);
      return NextResponse.json({ error: "Installation non trouvée" }, { status: 404 });
    }

    console.log("Installation trouvée:", installation);
    return NextResponse.json(installation);
  } catch (error) {
    console.error("Erreur dans l'API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
  
      const updatedInstallation = await prisma.installation_License.update({
        where: { id },
        data: {
          nomPoste: body.nomPoste,
          nomUtilisateur: body.nomUtilisateur,
          organisation: body.organisation,
          numeroFacture: body.numeroFacture,
          dateFacture: new Date(body.dateFacture),
          
        },
        include: {
          licenses: true
        }
      });
  
      return NextResponse.json(updatedInstallation);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'installation:", error);
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
    }
  }