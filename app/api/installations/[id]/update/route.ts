import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id, field, value, type } = await request.json();

    if (type === 'installation') {
      // Mise à jour de l'installation
      const updatedInstallation = await prisma.installation.update({
        where: { id: Number(id) },
        data: {
          [field]: value,
        },
      });
      return NextResponse.json(updatedInstallation);
    } else {
      // Mise à jour du matériel
      const updatedMateriel = await prisma.materiel.update({
        where: { id: Number(id) },
        data: {
          [field]: value,
        },
      });
      return NextResponse.json(updatedMateriel);
    }
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json(
      { error: 'Error updating data' },
      { status: 500 }
    );
  }
}
