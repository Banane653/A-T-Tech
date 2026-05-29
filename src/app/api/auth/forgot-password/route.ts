import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto'; // Module natif de Node.js pour générer des jetons sécurisés
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email requis" }, { status: 400 });
        }

        // 1. Chercher l'utilisateur
        const user = await prisma.merchantUser.findUnique({ where: { email } });

        // Pour des raisons de sécurité, même si l'utilisateur n'existe pas, on renvoie un succès
        // (Cela empêche les hackers de deviner quels e-mails sont inscrits sur ton site)
        if (!user) {
            return NextResponse.json({ success: true, message: "Si ce compte existe, un e-mail a été envoyé." });
        }

        // 2. Générer un jeton unique et sa date d'expiration (1 heure)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // + 1 heure

        // 3. Sauvegarder le jeton dans la base de données
        await prisma.merchantUser.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        });

        // 4. Créer le lien de réinitialisation
        const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;

        // 5. Envoyer l'e-mail avec Resend
        await resend.emails.send({
            from: 'Cardeo Support <contact@cardeo.be>', // ⚠️ À remplacer par ton adresse vérifiée sur Resend
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe Cardeo',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Bonjour ${user.name},</h2>
                    <p>Vous avez demandé à réinitialiser votre mot de passe sur Cardeo.</p>
                    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold;">
                        Réinitialiser mon mot de passe
                    </a>
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">
                        Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: "E-mail envoyé" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail" }, { status: 500 });
    }
}