import { NextResponse } from 'next/server';
import { generateGoogleWalletPass } from '@/services/googleWallet.service';
import { prisma } from '@/lib/prisma';
import { getCardTemplateData } from '@/lib/wallet-templates';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const companyId = searchParams.get('companyId'); // 👈 NOUVEAU: on a besoin de savoir pour quel commerce on crée la carte

        if (!name || !email || !companyId) {
            return new NextResponse("Nom, Email et ID de l'entreprise requis", { status: 400 });
        }

        let customer = await prisma.customer.findUnique({ 
            where: { email },
            include: { company: true } // 👈 NOUVEAU: on charge les infos du commerce
        });

        if (!customer) {
            const walletId = `WLT-${Date.now()}`;
            customer = await prisma.customer.create({
                data: { 
                    firstName: name, 
                    email, 
                    walletId, 
                    points: 0,
                    companyId // 👈 NOUVEAU: on l'associe au bon commerce
                },
                include: { company: true } 
            });
        }

        if (!customer.company || !customer.company.googleClassId) {
             return new NextResponse("Le commerce n'a pas configuré sa carte Google Wallet", { status: 400 });
        }

        const templateData = getCardTemplateData(customer.company, customer);

        const saveUrl = generateGoogleWalletPass(
            templateData.customer.firstName, 
            templateData.customer.walletId, 
            templateData.loyalty.points,
            customer.company.googleClassId,
            templateData.loyalty.systemType,
            templateData.colors.background,
            customer.company.cardTemplate,
            templateData.loyalty.level
        );

        // On renvoie du HTML pur
        return new NextResponse(`
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f3f4f6;">
                <a href="${saveUrl}" style="background:#000; color:#fff; padding:20px; border-radius:10px; text-decoration:none; font-family:sans-serif;">
                    ➕ Ajouter ma carte
                </a>
            </body>
        `, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error(error);
        return new NextResponse("Erreur serveur", { status: 500 });
    }
}