import { NextResponse } from 'next/server';
import { updateWalletPoints } from '@/services/googleWallet.service';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { walletId, amount } = body; // amount est optionnel (utilisé pour les points)

        // 1. Sécurité : On vérifie quel employé scanne
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const companyId = payload.companyId as string;

        // 2. On récupère le client ET son entreprise
        const customer = await prisma.customer.findUnique({ 
            where: { walletId },
            include: { company: true }
        });

        if (!customer) return NextResponse.json({ error: "Carte non reconnue" }, { status: 404 });
        
        // Sécurité : On vérifie que le client appartient bien à la même entreprise que l'employé
        if (customer.companyId !== companyId) {
            return NextResponse.json({ error: "Ce client n'appartient pas à votre commerce" }, { status: 403 });
        }

        let newPoints = customer.points;
        let message = "";

        // 3. Logique selon le système de l'entreprise
        if (customer.company?.systemType === "STAMPS") {
            newPoints += 1;
            if (newPoints >= 10) {
                newPoints = 0;
                message = "🎉 CARTE DE TAMPONS PLEINE ! Offrez la récompense !";
            } else {
                message = `✅ +1 Tampon ajouté. (${newPoints}/10)`;
            }
        } else {
            // SYSTÈME DE POINTS (ex: 1€ = 1 point)
            const pointsToAdd = Math.floor(Number(amount) || 0);
            if (pointsToAdd <= 0) return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
            
            newPoints += pointsToAdd;
            message = `✅ +${pointsToAdd} points ajoutés. Nouveau solde : ${newPoints}`;
        }

        // 4. Mise à jour DB et Google Wallet
        await prisma.customer.update({ where: { walletId }, data: { points: newPoints } });
        // Mise à jour de la carte Google Wallet
        if (customer.company) {
            await updateWalletPoints(
                walletId, 
                newPoints, 
                customer.company.systemType,   
                customer.company.primaryColor  
            );
        }
        return NextResponse.json({ success: true, message, newBalance: newPoints });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}