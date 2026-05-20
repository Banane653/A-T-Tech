// src/app/api/wallet/apple/v1/devices/[deviceId]/registrations/[passType]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string; passType: string }> }
) {
  try {
    const { deviceId, passType } = await params;

    // On cherche toutes les cartes enregistrées par cet iPhone
    const registrations = await prisma.applePassRegistration.findMany({
      where: {
        deviceLibraryIdentifier: deviceId,
        passTypeIdentifier: passType,
      },
    });

    if (registrations.length === 0) {
      return new Response(null, { status: 204 }); // 204 signifie "Rien à mettre à jour"
    }

    // On renvoie la liste des numéros de série à mettre à jour
    const serialNumbers = registrations.map(reg => reg.serialNumber);

    return NextResponse.json({
      serialNumbers: serialNumbers,
      lastUpdated: String(Date.now()), // Un repère temporel pour Apple
    });
  } catch (error) {
    console.error("Erreur GET registrations:", error);
    return new Response('Erreur Serveur', { status: 500 });
  }
}