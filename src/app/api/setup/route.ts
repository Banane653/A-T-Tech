import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-10-28.endive',
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, systemType, cardTemplate, primaryColor, logoUrl } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
        }

        // 1. On interroge Stripe pour vérifier que cette session est authentique
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const companyId = session.metadata?.companyId;

        if (!companyId) {
            return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
        }

        // 2. On met à jour l'entreprise dans Prisma
        await prisma.company.update({
            where: { id: companyId },
            data: {
                systemType, // 'STAMPS' ou 'POINTS'
                cardTemplate, // ex: 'default', 'coffee'...
                primaryColor,
                logoUrl: logoUrl || null,
            }
        });

        return NextResponse.json({ success: true, companyId });
    } catch (error) {
        console.error('Erreur Setup:', error);
        return NextResponse.json({ error: 'Erreur lors de la configuration' }, { status: 500 });
    }
}