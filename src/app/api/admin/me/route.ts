import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/auth';

export async function GET() {
    try {
        // 1. On regarde qui possède le cookie de connexion actuel
        const auth = await getAdminAuth();
        if (!auth) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // 2. On va chercher ses infos précises dans la base de données
        const user = await prisma.merchantUser.findUnique({
            where: { id: auth.userId },
            select: { 
                name: true, 
                email: true 
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Erreur API /me :", error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}