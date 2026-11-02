import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import bcrypt from 'bcrypt';

// Initialisation de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-10-28.endive',
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { companyName, vatNumber, name, email, password, plan } = body;

        if (!companyName || !name || !email || !password) {
            return NextResponse.json({ error: 'Veuillez remplir tous les champs obligatoires.' }, { status: 400 });
        }

        // 1. Vérifier si l'email existe déjà (le gérant a déjà un compte)
        const existingUser = await prisma.merchantUser.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 400 });
        }

        // 2. Hacher le mot de passe du gérant
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Créer l'entreprise (inactive) et son compte gérant (ADMIN)
        const company = await prisma.company.create({
            data: {
                name: companyName,
                vatNumber: vatNumber || null,
                subscriptionStatus: 'inactive', // Bloqué tant que Stripe n'a pas validé
                users: {
                    create: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'ADMIN',
                    }
                }
            }
        });

        // 4. Déterminer le tarif Stripe selon le choix du commerçant
        const priceId = plan === 'yearly' 
            ? process.env.STRIPE_PRICE_ID_YEARLY 
            : process.env.STRIPE_PRICE_ID_MONTHLY;

        // 5. Créer la session Stripe Checkout
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer_email: email, // Pré-remplit l'email sur la page Stripe
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                companyId: company.id, // VITAL : Permettra au Webhook de savoir qui a payé !
            },
            success_url: `${protocol}://${host}/dashboard?onboarding=success`,
            cancel_url: `${protocol}://${host}/onboarding?canceled=true`,
        });

        // 6. Renvoyer l'URL Stripe au frontend pour rediriger l'utilisateur
        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('Erreur Onboarding:', error);
        return NextResponse.json({ error: 'Erreur lors de la création de la session.' }, { status: 500 });
    }
}