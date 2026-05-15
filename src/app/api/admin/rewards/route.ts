import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminAuth, getScannerAuth } from '@/lib/auth';

export async function GET() {
    const auth = await getScannerAuth();
    if (!auth) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const rewards = await prisma.reward.findMany({
            where: { companyId: auth.companyId },
            orderBy: { cost: 'asc' },
            select: { id: true, name: true, cost: true, createdAt: true },
        });
        return NextResponse.json({ rewards });
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const { name, cost } = await request.json();
        if (!name?.trim()) {
            return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
        }
        const parsedCost = Number(cost);
        if (!Number.isInteger(parsedCost) || parsedCost <= 0) {
            return NextResponse.json({ error: 'Le coût doit être un entier positif' }, { status: 400 });
        }

        const reward = await prisma.reward.create({
            data: {
                name: name.trim(),
                cost: parsedCost,
                companyId: admin.companyId,
            },
        });
        return NextResponse.json({ success: true, reward });
    } catch {
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const admin = await getAdminAuth();
    if (!admin) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

        const reward = await prisma.reward.findFirst({
            where: { id, companyId: admin.companyId },
        });
        if (!reward) return NextResponse.json({ error: 'Récompense introuvable' }, { status: 404 });

        await prisma.reward.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}
