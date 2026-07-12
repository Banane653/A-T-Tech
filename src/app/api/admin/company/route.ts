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
                latitude: true,
                longitude: true,
                proximityText: true,
                address: true
            },
        });
        return NextResponse.json({ company });
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const body = await request.json();
        const { pointsRatio, latitude, longitude, proximityText, isGpsUpdate, address } = body;

        // Cas A : C'est une mise à jour des paramètres GPS Marketing
        if (isGpsUpdate) {
            const parsedLat = parseFloat(latitude);
            const parsedLng = parseFloat(longitude);

            if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng) || !proximityText) {
                return NextResponse.json({ error: 'Données GPS invalides' }, { status: 400 });
            }

            // 1. Sauvegarde en Base de données
            const updatedCompany = await prisma.company.update({
                where: { id: admin.companyId },
                data: {
                    latitude: parsedLat,
                    longitude: parsedLng,
                    address: address,
                    proximityText: proximityText
                }
            });

            // 2. Synchronisation Google Wallet Class
            await updateGoogleClassLocations(admin.companyId, parsedLat, parsedLng);

            // 3. Notification Push en arrière plan à tous les clients Apple du commerce
            // On récupère tous les clients de cette entreprise pour relancer leurs iPhones
            const customers = await prisma.customer.findMany({
                where: { companyId: admin.companyId }
            });
            for (const c of customers) {
                await sendAppleWalletPush(c.walletId);
            }

            return NextResponse.json({ success: true, company: updatedCompany });
        }

        // Cas B : C'est ta mise à jour historique du Taux de points (Inchangé)
        const parsedRatio = Math.max(0.01, Number(pointsRatio) || 1);
        await prisma.company.update({
            where: { id: admin.companyId },
            data: { pointsRatio: parsedRatio },
        });

        return NextResponse.json({ success: true, pointsRatio: parsedRatio });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
    }
}