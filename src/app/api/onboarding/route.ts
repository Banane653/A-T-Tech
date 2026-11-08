import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose'; // 👈 1. Ajoute l'import de jose

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-10-28.endive',
});

// Clé secrète pour le token (la même que dans ton middleware)
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { companyName, vatNumber, name, email, password, plan, username, locale } = body;
        
        const userLocale = locale || 'fr';

        // ... (Vérifications d'email et username existants comme avant) ...

        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Modifie légèrement la création pour récupérer le "User"
        const company = await prisma.company.create({
            data: {
                name: companyName,
                vatNumber: vatNumber || null,
                subscriptionStatus: 'inactive',
                users: {
                    create: {
                        name,
                        email,
                        username: username || null,
                        password: hashedPassword,
                        role: 'ADMIN',
                    }
                }
            },
            include: { users: true } // 👈 VITAL: Demande à Prisma de renvoyer l'utilisateur créé
        });

        const newUser = company.users[0];

        // 3. AUTO-LOGIN : Création du token JWT
        const token = await new SignJWT({ 
            sub: newUser.id, 
            role: newUser.role,
            companyId: company.id
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d') // Valable 7 jours
            .sign(SECRET_KEY);

        // 4. Création de la session Stripe
        const priceId = plan === 'yearly' ? process.env.STRIPE_PRICE_ID_YEARLY : process.env.STRIPE_PRICE_ID_MONTHLY;
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: { companyId: company.id },
            // On le renvoie directement sur le setup !
            success_url: `${protocol}://${host}/${userLocale}/setup?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${protocol}://${host}/${userLocale}/onboarding?canceled=true`,
        });

        // 5. On prépare la réponse et on injecte le cookie de connexion
        const response = NextResponse.json({ url: session.url });
        
        response.cookies.set('auth_token', token, {
            httpOnly: true, // Sécurisé contre les attaques XSS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Important pour conserver le cookie au retour de Stripe
            maxAge: 60 * 60 * 24 * 7 // 7 jours
        });

        return response;

    } catch (error) {
        console.error('Erreur Onboarding:', error);
        return NextResponse.json({ error: 'Erreur lors de la création de la session.' }, { status: 500 });
    }
}