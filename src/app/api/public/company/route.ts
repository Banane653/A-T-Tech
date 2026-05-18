import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!companyId) {
        return NextResponse.json({ error: 'companyId requis' }, { status: 400 });
    }

    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                name: true,
                logoUrl: true,
                primaryColor: true,
                textColor: true,
            },
        });

        if (!company) {
            return NextResponse.json({ error: 'Commerce introuvable' }, { status: 404 });
        }

        return NextResponse.json({ company });
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
