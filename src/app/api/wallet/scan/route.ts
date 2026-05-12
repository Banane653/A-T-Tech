import { NextResponse } from 'next/server';
import { updateWalletPoints } from '@/services/googleWallet.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // Dans Next.js, on récupère le body comme ça :
        const body = await request.json();
        const { walletId, systemType, amount } = body;

        if (!walletId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

        const customer = await prisma.customer.findUnique({ where: { walletId } });
        if (!customer) return NextResponse.json({ error: "Carte non reconnue" }, { status: 404 });

        let newPoints = customer.points;
        let message = "";

        if (systemType === "STAMPS") {
            newPoints += 1;
            if (newPoints >= 10) {
                newPoints = 0;
                message = "🎉 TAMPONS REMPLIS ! Offrez la récompense !";
            } else {
                message = `✅ +1 Tampon ajouté. Total: ${newPoints}/10`;
            }
        } 

        await prisma.customer.update({ where: { walletId }, data: { points: newPoints } });
        await updateWalletPoints(walletId, newPoints);

        return NextResponse.json({ success: true, message, newBalance: newPoints });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}