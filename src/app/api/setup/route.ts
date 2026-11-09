import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { createCompanyGoogleClass } from '@/services/googleWallet.service';
import { getAdminAuth } from '@/lib/auth'; // 👈 1. Ajoute ton système d'auth

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-10-28.endive',
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, systemType, cardTemplate, primaryColor, logoUrl, maxStamps } = body;

        // 2. 🔥 On identifie l'entreprise prioritairement via le cookie de connexion !
        const admin = await getAdminAuth();
        let companyId = admin?.companyId;

        // 3. Plan B de secours : Si le cookie a expiré mais qu'on a le retour de Stripe
        if (!companyId && sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            companyId = session.metadata?.companyId;
        }

        // Si on n'a ni cookie, ni session Stripe valide : on bloque.
        if (!companyId) {
            return NextResponse.json({ error: 'Non autorisé ou entreprise introuvable' }, { status: 401 });
        }

        // 4. On récupère le nom de l'entreprise pour Google
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true }
        });

        if (!company) {
             return NextResponse.json({ error: 'Entreprise introuvable dans la base' }, { status: 404 });
        }

        // ... LE RESTE DE TON CODE EST PARFAIT ET RESTE IDENTIQUE ...
        
        let finalGoogleClassId = null;
        try {
            finalGoogleClassId = await createCompanyGoogleClass({
                id: companyId,
                name: company.name,
                primaryColor,
                logoUrl: logoUrl || null
            });
        } catch (googleError) {
            console.error("Erreur critique Google Class:", googleError);
        }

        await prisma.company.update({
            where: { id: companyId },
            data: {
                systemType,
                cardTemplate, 
                primaryColor,
                logoUrl: logoUrl || null,
                maxStamps: Number(maxStamps) || 10,
                googleClassId: finalGoogleClassId, 
            }
        });

        return NextResponse.json({ success: true, companyId });
    } catch (error) {
        console.error('Erreur Setup:', error);
        return NextResponse.json({ error: 'Erreur lors de la configuration' }, { status: 500 });
    }
}