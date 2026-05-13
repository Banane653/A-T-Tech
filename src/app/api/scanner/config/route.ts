import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_pour_dev');

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const { payload } = await jwtVerify(token, SECRET_KEY);
        
        // Ici, on accepte le Gérant (ADMIN) et le Serveur (EMPLOYEE)
        if (payload.role !== 'ADMIN' && payload.role !== 'EMPLOYEE') {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const companyId = payload.companyId as string;

        // On ne renvoie QUE les infos nécessaires au scanner (pas les employés !)
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true, systemType: true }
        });

        return NextResponse.json({ company });
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}