import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        // 1. Chercher l'utilisateur avec ce jeton, en vérifiant que la date n'est pas expirée
        const user = await prisma.merchantUser.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // gt = greater than (strictement supérieur à maintenant)
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Ce lien est invalide ou a expiré." }, { status: 400 });
        }

        // 2. Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Mettre à jour l'utilisateur et effacer le jeton
        await prisma.merchantUser.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null, // On nettoie le jeton pour qu'il ne soit plus utilisable
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ success: true, message: "Mot de passe modifié avec succès" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}