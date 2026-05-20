import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    });

    if (!customer) {
      return new Response('Pass introuvable', { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/api/wallet/apple?name=${encodeURIComponent(customer.firstName)}&email=${encodeURIComponent(customer.email)}&companyId=${encodeURIComponent(customer.companyId || '')}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    return new Response('Erreur Serveur', { status: 500 });
  }
}