import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. L'iPhone s'enregistre (Ajout ou Réactivation de la carte)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ deviceId: string; passType: string; serialNumber: string }> } // 👈 1. params devient une Promise
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('ApplePass ')) {
      return new Response('Non autorisé', { status: 401 });
    }

    // 👇 2. On "await" les paramètres avant de s'en servir 👇
    const { deviceId, passType, serialNumber } = await params;

    const body = await request.json();
    const { pushToken } = body as { pushToken: string };

    await prisma.applePassRegistration.upsert({
      where: {
        deviceLibraryIdentifier_serialNumber: {
          deviceLibraryIdentifier: deviceId,
          serialNumber: serialNumber,
        },
      },
      update: { pushToken },
      create: {
        deviceLibraryIdentifier: deviceId,
        serialNumber: serialNumber,
        passTypeIdentifier: passType,
        pushToken,
      },
    });

    console.log(`📱 Nouvel iPhone enregistré pour le pass : ${serialNumber}`);
    return new Response(null, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response('Erreur Serveur', { status: 500 });
  }
}

// 2. L'utilisateur supprime la carte de son Wallet (Désenregistrement)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ deviceId: string; passType: string; serialNumber: string }> }
) {
  try {
    const { deviceId, serialNumber } = await params; // 👈 Await ici aussi

    await prisma.applePassRegistration.deleteMany({
      where: {
        deviceLibraryIdentifier: deviceId,
        serialNumber: serialNumber,
      },
    });
    console.log(`🗑️ iPhone désenregistré pour le pass : ${serialNumber}`);
    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response('Erreur Serveur', { status: 500 });
  }
}