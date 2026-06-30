import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/auth';

export async function GET() {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const company = await prisma.company.findUnique({
            where: { id: admin.companyId },
            select: { 
                id: true, 
                name: true, 
                pointsRatio: true, 
                systemType: true 
            },
        });
        return NextResponse.json({ company });
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const { pointsRatio } = await request.json();

        // On s'assure que le ratio est bien un nombre supérieur à 0
        const parsedRatio = Math.max(0.01, Number(pointsRatio) || 1);

        await prisma.company.update({
            where: { id: admin.companyId },
            data: { pointsRatio: parsedRatio },
        });

        return NextResponse.json({ success: true, pointsRatio: parsedRatio });
    } catch {
        return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
    }
}