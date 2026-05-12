import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

// Petit agent de sécurité interne à l'API pour être sûr que c'est bien toi
async function verifyFounder() {
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload.role === 'FOUNDER';
    } catch {
        return false;
    }
}

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
        // 👈 On récupère le systemType envoyé par le formulaire
        const { companyName, adminName, adminEmail, adminPassword, systemType } = body;

        if (!companyName || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
        }

        // On vérifie si l'email existe déjà
        const existingUser = await prisma.merchantUser.findUnique({ where: { email: adminEmail } });
        if (existingUser) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // On crée l'entreprise avec son systemType
        const newCompany = await prisma.company.create({
            data: {
                name: companyName,
                systemType: systemType || 'STAMPS', // 👈 On sauvegarde le choix (ou STAMPS par défaut)
                users: {
                    create: {
                        name: adminName,
                        email: adminEmail,
                        password: hashedPassword,
                        role: "ADMIN"
                    }
                }
            }
        });

        return NextResponse.json({ success: true, company: newCompany });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}