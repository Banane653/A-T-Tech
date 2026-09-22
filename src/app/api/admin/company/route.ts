import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/auth';
import { sendAppleWalletPush } from '@/services/appleWallet.service';
import { updateGoogleClassLocations } from '@/services/googleWallet.service';

export async function GET() {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const company = await prisma.company.findUnique({
            where: { id: admin.companyId },
            select: { 
                id: true, 
                name: true, 
                logoUrl: true,
                pointsRatio: true, 
                systemType: true,
                locations: true // 👈 On charge la NOUVELLE table des adresses multiples
            },
        });
        return NextResponse.json({ company });
    } catch (error) {
        console.error("❌ Erreur GET Company:", error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const body = await request.json();
        const { pointsRatio, isGpsUpdate, locations } = body;

        // Cas A : C'est une mise à jour des paramètres GPS Marketing Multi-Adresses
        if (isGpsUpdate) {
            // Sécurité absolue : on refuse plus de 10 adresses (Limitation Apple Wallet)
            if (!Array.isArray(locations) || locations.length > 10) {
                return NextResponse.json({ error: 'Maximum 10 adresses autorisées par Apple' }, { status: 400 });
            }

            // 1. Sauvegarde en Base de données (Transaction Prisma)
            // On supprime proprement les anciennes adresses du commerce et on enregistre la nouvelle liste
            await prisma.$transaction([
                prisma.companyLocation.deleteMany({ 
                    where: { companyId: admin.companyId } 
                }),
                prisma.companyLocation.createMany({
                    data: locations.map((loc: any) => ({
                        name: loc.name || "Boutique",
                        address: loc.address,
                        latitude: parseFloat(loc.latitude),
                        longitude: parseFloat(loc.longitude),
                        proximityText: loc.proximityText,
                        companyId: admin.companyId
                    }))
                })
            ]);

            // On récupère la liste toute neuve pour l'envoyer à Google
            const updatedLocations = await prisma.companyLocation.findMany({
                where: { companyId: admin.companyId }
            });

            // 2. Synchronisation Google Wallet Class avec la nouvelle liste
            await updateGoogleClassLocations(admin.companyId, updatedLocations);

            // 3. Notification Push en arrière plan à tous les clients Apple du commerce
            const customers = await prisma.customer.findMany({
                where: { companyId: admin.companyId }
            });
            for (const c of customers) {
                await sendAppleWalletPush(c.walletId);
            }

            return NextResponse.json({ success: true, locations: updatedLocations });
        }

        // Cas B : C'est ta mise à jour historique du Taux de points (Inchangé)
        const parsedRatio = Math.max(0.01, Number(pointsRatio) || 1);
        await prisma.company.update({
            where: { id: admin.companyId },
            data: { pointsRatio: parsedRatio },
        });

        return NextResponse.json({ success: true, pointsRatio: parsedRatio });
    } catch (err) {
        console.error("❌ Erreur PATCH Company:", err);
        return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
    }
}