import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { passType: string; serialNumber: string } }
) {
  try {
    // 1. Sécurité imposée par Apple
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('ApplePass ')) {
      return new Response('Non autorisé', { status: 401 });
    }

    // Le serialNumber ressemble à : WLT-123456-7891011 (walletId + timestamp)
    // On extrait le vrai walletId du client pour retrouver ses infos
    const walletId = params.serialNumber.split('-')[0] + '-' + params.serialNumber.split('-')[1];

    const customer = await prisma.customer.findUnique({
      where: { walletId },
    });

    if (!customer) {
      return new Response('Pass introuvable', { status: 404 });
    }

    // 2. Redirection magique vers ta route de création existante en passant les bons paramètres !
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/api/wallet/apple?name=${encodeURIComponent(customer.firstName)}&email=${encodeURIComponent(customer.email)}&companyId=${encodeURIComponent(customer.companyId || '')}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    return new Response('Erreur Serveur', { status: 500 });
  }
}