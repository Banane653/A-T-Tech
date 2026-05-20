import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateGoogleWalletPass } from '@/services/googleWallet.service';
import { getCardTemplateData } from '@/lib/wallet-templates';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, birthDate, companyId } = body; 

        if (!firstName || !email || !companyId) {
            return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
        }

        // 1. On cherche le client, ET on demande à inclure son entreprise
        let customer = await prisma.customer.findUnique({ 
            where: { email },
            include: { company: true } // 👈 NOUVEAU : On charge l'entreprise avec
        });

        // Si le client n'existe pas, on le crée ET on inclut son entreprise en retour
        if (!customer) {
            const walletId = `WLT-${Date.now()}`;
            customer = await prisma.customer.create({
                data: { 
                    firstName, 
                    lastName, 
                    email, 
                    birthDate, 
                    walletId, 
                    points: 0,
                    companyId 
                },
                include: { company: true } // 👈 NOUVEAU : On demande à Prisma de nous renvoyer l'entreprise
            });
        }

        // Sécurité : On vérifie que l'entreprise a bien un modèle Google Wallet configuré
        if (!customer.company?.googleClassId) {
             return NextResponse.json({ error: "Ce commerce n'a pas encore configuré ses cartes Wallet." }, { status: 400 });
        }

        const templateData = getCardTemplateData(customer.company, customer);

        // 2. Génération du pass Google Wallet personnalisé
        const saveUrl = generateGoogleWalletPass(
            templateData.customer.firstName, 
            templateData.customer.walletId, 
            templateData.loyalty.points, 
            customer.company.googleClassId,
            templateData.loyalty.systemType,   
            templateData.colors.background,
            customer.company.cardTemplate
        );
        
        return NextResponse.json({ saveUrl });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
    }
}