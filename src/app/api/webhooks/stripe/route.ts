import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-10-28.endive',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    try {
        const body = await request.text(); // On doit lire le corps brut (raw) pour la sécurité Stripe
        const signature = headers().get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            // Vérification cryptographique ultra-sécurisée par Stripe
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('❌ Erreur de signature Webhook:', err.message);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        // Si le paiement de l'abonnement est un succès total
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // On récupère le companyId qu'on avait glissé dans les métadonnées lors du clic sur "S'abonner"
            const companyId = session.metadata?.companyId;

            if (companyId) {
                // On met à jour l'entreprise dans la base de données !
                await prisma.company.update({
                    where: { id: companyId },
                    data: {
                        subscriptionStatus: 'active', // 🚀 Le compte est débloqué !
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                    },
                });
                console.log(`✅ Abonnement activé pour l'entreprise ${companyId}`);
            }
        }

        // Gestion de l'annulation (si la carte expire ou si le client annule via le portail)
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            
            await prisma.company.updateMany({
                where: { stripeSubscriptionId: subscription.id },
                data: { subscriptionStatus: 'canceled' },
            });
            console.log(`❌ Abonnement annulé (Sub ID: ${subscription.id})`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('❌ Erreur critique Webhook:', error);
        return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
    }
}