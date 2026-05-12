import { NextResponse } from 'next/server';
import { generateGoogleWalletPass } from '@/services/googleWallet.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Dans Next.js, on récupère les query params comme ça :
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const email = searchParams.get('email');

        if (!name || !email) {
            return new NextResponse("Nom et Email requis", { status: 400 });
        }

        let customer = await prisma.customer.findUnique({ where: { email } });

        if (!customer) {
            const walletId = `WLT-${Date.now()}`;
            customer = await prisma.customer.create({
                data: { firstName: name, email, walletId, points: 0 }
            });
        }

        const saveUrl = generateGoogleWalletPass(customer.firstName, customer.walletId, customer.points);

        // On renvoie du HTML pur, comme sur Express
        return new NextResponse(`
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f3f4f6;">
                <a href="${saveUrl}" style="background:#000; color:#fff; padding:20px; border-radius:10px; text-decoration:none; font-family:sans-serif;">
                    ➕ Ajouter ma carte (Solde: ${customer.points} pts)
                </a>
            </body>
        `, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error(error);
        return new NextResponse("Erreur serveur", { status: 500 });
    }
}