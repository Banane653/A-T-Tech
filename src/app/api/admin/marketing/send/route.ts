import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppleWalletPush } from '@/services/appleWallet.service';
import { sendGoogleWalletMessage } from '@/services/googleWallet.service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { companyId, title, message } = body;

        // Vérification de sécurité
        if (!companyId || !title || !message) {
            return new NextResponse("Titre et message obligatoires", { status: 400 });
        }

        // 1. Sauvegarder la campagne dans la base de données (Historique)
        const campaign = await prisma.marketingCampaign.create({
            data: {
                title: title,
                message: message,
                companyId: companyId
            }
        });

        // 2. Trouver tous les clients qui appartiennent à ce commerce
        const customers = await prisma.customer.findMany({
            where: { companyId: companyId }
        });

        if (customers.length === 0) {
            return NextResponse.json({ success: true, message: "Campagne enregistrée, mais aucun client à notifier." });
        }

        // 3. Boucler sur les clients et envoyer les notifications
        // On utilise Promise.allSettled pour envoyer à tout le monde en même temps sans bloquer si une carte échoue
        const pushPromises = customers.map(async (customer) => {
            const walletId = customer.walletId;

            // On lance Apple et Google. 
            // - Si le client n'a pas d'iPhone, sendAppleWalletPush s'arrêtera poliment (grâce à notre condition).
            // - Si le client n'a pas Google, sendGoogleWalletMessage échouera silencieusement (catch).
            await Promise.allSettled([
                sendAppleWalletPush(walletId),
                sendGoogleWalletMessage(walletId, title, message)
            ]);
        });

        // On attend que tous les signaux soient partis
        await Promise.allSettled(pushPromises);

        console.log(`🚀 Campagne "${title}" envoyée à ${customers.length} clients !`);

        return NextResponse.json({ 
            success: true, 
            campaignId: campaign.id, 
            notifiedCount: customers.length 
        });

    } catch (error) {
        console.error("❌ Erreur lors du déclenchement de la campagne :", error);
        return new NextResponse("Erreur serveur", { status: 500 });
    }
}