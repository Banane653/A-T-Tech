import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyFounder } from '@/lib/auth';
import { createCompanyGoogleClass } from '@/services/googleWallet.service';

// Récupérer la liste des commerces
export async function GET() {
    if (!(await verifyFounder())) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    try {
        const companies = await prisma.company.findMany({
            include: {
                users: { where: { role: 'ADMIN' }, select: { name: true, email: true } },
                _count: { select: { customers: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(companies);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
    }
}

// Créer un nouveau commerce ET son patron
export async function POST(request: Request) {
    if (!(await verifyFounder())) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    try {
        const body = await request.json();
        const { companyName, adminName, adminEmail, adminPassword, systemType, primaryColor, logoUrl, cardTemplate } = body;

        if (!companyName || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
        }

        const existingUser = await prisma.merchantUser.findUnique({ where: { email: adminEmail } });
        if (existingUser) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // 1. On crée d'abord le commerce dans NOTRE base de données (sans l'ID Google)
        let newCompany = await prisma.company.create({
            data: {
                name: companyName,
                systemType: systemType || 'STAMPS',
                primaryColor: primaryColor || '#000000',
                logoUrl: logoUrl || null,
                cardTemplate: cardTemplate || 'default',
                users: {
                    create: { name: adminName, email: adminEmail, password: hashedPassword, role: "ADMIN" }
                }
            }
        });

        // 2. 🪄 MAGIE : On demande à Google de créer le moule avec le design !
        try {
            const googleClassId = await createCompanyGoogleClass({
                id: newCompany.id,
                name: newCompany.name,
                primaryColor: newCompany.primaryColor,
                logoUrl: newCompany.logoUrl
            });

            // 3. On met à jour notre base de données avec l'ID du moule Google
            newCompany = await prisma.company.update({
                where: { id: newCompany.id },
                data: { googleClassId: googleClassId }
            });
            
        } catch (googleError) {
            // Si Google plante (ex: problème de connexion), le commerce est créé, 
            // mais on prévient que la carte n'est pas configurée.
            console.error("Échec de création de la Google Class, mais le commerce est créé.");
        }

        return NextResponse.json({ success: true, company: newCompany });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}