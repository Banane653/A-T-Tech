import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// On initialise Resend avec la clé de ton fichier .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        // On récupère les données envoyées par le formulaire côté client
        const { name, email, company, message } = await req.json();

        // On vérifie que les champs obligatoires sont là
        if (!name || !email || !message) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
        }

        // On ordonne à Resend d'envoyer l'email
        const data = await resend.emails.send({
            from: 'Cardeo Contact <contact@cardeo.be>',
            to: [process.env.CONTACT_EMAIL || 'contact@cardeo.be'], // Ton adresse de réception
            subject: `Nouveau message de ${name} - Cardeo`,
            replyTo: email, // Permet de faire "Répondre" directement à ton prospect dans ta boîte mail !
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Nouveau contact depuis le site web</h2>
                    
                    <p><strong>Nom :</strong> ${name}</p>
                    <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Commerce :</strong> ${company || 'Non renseigné'}</p>
                    
                    <h3 style="margin-top: 30px;">Message :</h3>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #000; border-radius: 4px; white-space: pre-wrap;">
                        ${message}
                    </div>
                    
                    <p style="font-size: 12px; color: #888; margin-top: 40px; text-align: center;">
                        Cet email a été envoyé depuis le formulaire de contact de Cardeo.
                    </p>
                </div>
            `
        });

        if (data.error) {
            console.error("Erreur Resend :", data.error);
            return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Erreur API Contact :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}