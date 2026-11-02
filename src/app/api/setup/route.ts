import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { createCompanyGoogleClass } from '@/services/googleWallet.service'; // 👈 Import de ta fonction existante

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

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const companyId = session.metadata?.companyId;

        if (!companyId) {
            return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
        }

        // 1. On récupère le nom de l'entreprise pour Google
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true }
        });

        if (!company) {
             return NextResponse.json({ error: 'Entreprise introuvable dans la base' }, { status: 404 });
        }

        // 2. 🔥 On demande à l'API Google de créer le moule officiel 🔥
        let finalGoogleClassId = null;
        try {
            // L'appel à ton fichier service
            finalGoogleClassId = await createCompanyGoogleClass({
                id: companyId,
                name: company.name,
                primaryColor,
                logoUrl: logoUrl || null
            });
        } catch (googleError) {
            console.error("Erreur critique lors de la création Google Class:", googleError);
            // On peut choisir de continuer même si Google échoue, ou bloquer l'utilisateur. 
            // C'est mieux de logger l'erreur et de laisser passer pour ne pas bloquer le setup post-paiement.
        }

        // 3. On met à jour l'entreprise dans Prisma (avec le VRAI ID validé par Google)
        await prisma.company.update({
            where: { id: companyId },
            data: {
                systemType,
                cardTemplate, 
                primaryColor,
                logoUrl: logoUrl || null,
                googleClassId: finalGoogleClassId, 
            }
        });

        return NextResponse.json({ success: true, companyId });
    } catch (error) {
        console.error('Erreur Setup:', error);
        return NextResponse.json({ error: 'Erreur lors de la configuration' }, { status: 500 });
    }
}