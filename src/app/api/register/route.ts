import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateGoogleWalletPass } from '@/services/googleWallet.service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, birthDate } = body;

        if (!firstName || !email) {
            return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }

        // 1. On cherche ou on crée le client
        let customer = await prisma.customer.findUnique({ where: { email } });

        if (!customer) {
            const walletId = `WLT-${Date.now()}`;
            customer = await prisma.customer.create({
                data: { firstName, lastName, email, birthDate, walletId, points: 0 }
            });
        }

        // 2. On génère le lien magique
        const saveUrl = generateGoogleWalletPass(customer.firstName, customer.walletId, customer.points);

        return NextResponse.json({ saveUrl });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
    }
}