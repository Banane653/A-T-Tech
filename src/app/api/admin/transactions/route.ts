import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth } from '@/lib/auth';

export async function GET() {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const transactions = await prisma.transaction.findMany({
            where: { companyId: admin.companyId },
            include: {
                customer: {
                    select: { firstName: true, lastName: true, email: true },
                },
                merchantUser: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ transactions });
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
