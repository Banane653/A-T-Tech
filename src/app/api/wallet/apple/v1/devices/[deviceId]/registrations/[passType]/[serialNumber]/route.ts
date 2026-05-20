import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. L'iPhone s'enregistre (Ajout ou Réactivation de la carte)
export async function POST(
  request: Request,
  { params }: { params: { deviceId: string; passType: string; serialNumber: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('ApplePass ')) {
      return new Response('Non autorisé', { status: 401 });
    }

    const body = await request.json();
    const { pushToken } = body as { pushToken: string };

    // Enregistrement ou mise à jour en base de données
    await prisma.applePassRegistration.upsert({
      where: {
        deviceLibraryIdentifier_serialNumber: {
          deviceLibraryIdentifier: params.deviceId,
          serialNumber: params.serialNumber,
        },
      },
      update: { pushToken },
      create: {
        deviceLibraryIdentifier: params.deviceId,
        serialNumber: params.serialNumber,
        passTypeIdentifier: params.passType,
        pushToken,
      },
    });

    console.log(`📱 Nouvel iPhone enregistré pour le pass : ${params.serialNumber}`);
    return new Response(null, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response('Erreur Serveur', { status: 500 });
  }
}

// 2. L'utilisateur supprime la carte de son Wallet (Désenregistrement)
export async function DELETE(
  request: Request,
  { params }: { params: { deviceId: string; passType: string; serialNumber: string } }
) {
  try {
    await prisma.applePassRegistration.deleteMany({
      where: {
        deviceLibraryIdentifier: params.deviceId,
        serialNumber: params.serialNumber,
      },
    });
    console.log(`🗑️ iPhone désenregistré pour le pass : ${params.serialNumber}`);
    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response('Erreur Serveur', { status: 500 });
  }
}