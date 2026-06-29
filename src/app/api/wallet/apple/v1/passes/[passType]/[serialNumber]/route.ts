import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GET as generatePass } from '@/app/api/wallet/apple/route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ passType: string; serialNumber: string }> } // 👈 Promesse
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('ApplePass ')) {
      return new Response('Non autorisé', { status: 401 });
    }

    // 👇 On extrait les paramètres asynchrones 👇
    const { serialNumber } = await params;

    // Le serialNumber ressemble à : WLT-123456-7891011
    const walletId = serialNumber;

    const customer = await prisma.customer.findUnique({
      where: { walletId },
      include: { company: true }
    });

    if (!customer) {
      return new Response('Pass introuvable', { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const fakeUrl = new URL(`${baseUrl}/api/wallet/apple`);
    fakeUrl.searchParams.set('name', customer.firstName);
    fakeUrl.searchParams.set('email', customer.email);
    fakeUrl.searchParams.set('companyId', customer.companyId || '');

    // On crée une fausse requête pour tromper gentiment ton propre code
    const fakeRequest = new Request(fakeUrl.toString(), {
      headers: request.headers,
    });

    // 🚀 BOUM ! On appelle ta grosse fonction et on renvoie le fichier à l'iPhone
    return await generatePass(fakeRequest);

  } catch (error) {
    console.error("❌ Erreur de mise à jour Apple:", error);
    return new NextResponse('Erreur Serveur', { status: 500 });
  }
}