import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { createOdooInvoice } from '@/services/odoo.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-10-28.endive',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    try {
        const body = await request.text(); // On doit lire le corps brut (raw) pour la sécurité Stripe
        
        // CORRECTION ICI : On attend (await) la liste des headers
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

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
         const companyId = session.metadata?.companyId;

         if (companyId) {
             // 1. Mettre à jour la base de données Prisma
             const updatedCompany = await prisma.company.update({
                 where: { id: companyId },
                 data: {
                     subscriptionStatus: 'active',
                     stripeCustomerId: session.customer as string,
                     stripeSubscriptionId: session.subscription as string,
                 },
                 // On demande à Prisma de nous renvoyer les infos nécessaires pour la facture
                 include: {
                     users: {
                         where: { role: 'ADMIN' },
                         take: 1
                     }
                 }
             });
             console.log(`✅ Abonnement activé pour l'entreprise ${companyId}`);

             // 2. Générer la facture Odoo en arrière-plan
             const adminUser = updatedCompany.users[0];
             if (adminUser) {
                 // On ne bloque pas l'exécution avec un "await" stricte pour répondre vite à Stripe
                 createOdooInvoice(
                     updatedCompany.name,
                     adminUser.email,
                     updatedCompany.vatNumber,
                     session.amount_total || 0 // Stripe donne le montant exact payé en centimes
                 ).catch(err => console.error("Échec silencieux Odoo:", err));
             }
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