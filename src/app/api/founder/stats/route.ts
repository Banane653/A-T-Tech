import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFounder } from '@/lib/auth';

type GrowthPoint = { label: string; newCustomers: number; totalCustomers: number };

function formatDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function formatMonthKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
}

function formatLabel(key: string, useDaily: boolean): string {
    if (useDaily) {
        const [year, month, day] = key.split('-');
        return `${day}/${month}/${year}`;
    }
    const [year, month] = key.split('-');
    return `${month}/${year}`;
}

function buildCustomerGrowth(
    customers: { createdAt: Date }[],
    useDaily: boolean
): GrowthPoint[] {
    if (customers.length === 0) return [];

    const sorted = [...customers].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const buckets = new Map<string, number>();
    for (const customer of sorted) {
        const key = useDaily
            ? formatDayKey(customer.createdAt)
            : formatMonthKey(customer.createdAt);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    const keys = Array.from(buckets.keys()).sort();
    let cumulative = 0;

    return keys.map((key) => {
        const newCustomers = buckets.get(key) ?? 0;
        cumulative += newCustomers;
        return {
            label: formatLabel(key, useDaily),
            newCustomers,
            totalCustomers: cumulative,
        };
    });
}

export async function GET() {
    if (!(await verifyFounder())) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    try {
        const [
            totalCompanies,
            totalCustomers,
            rewardsPointsCount,
            stampsResetCount,
            pointsAggregate,
            stampsAggregate,
            customers,
        ] = await Promise.all([
            prisma.company.count(),
            prisma.customer.count(),
            prisma.transaction.count({ where: { type: 'SPEND' } }),
            prisma.transaction.count({ where: { type: 'RESET' } }),
            prisma.transaction.aggregate({
                where: {
                    type: 'EARN',
                    company: { systemType: 'POINTS' },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    type: 'EARN',
                    company: { systemType: 'STAMPS' },
                },
                _sum: { amount: true },
            }),
            prisma.customer.findMany({
                select: { createdAt: true },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        const oldest = customers[0]?.createdAt;
        const daysSpan = oldest
            ? (Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24)
            : 0;
        const useDaily = daysSpan <= 90;
        const customerGrowth = buildCustomerGrowth(customers, useDaily);

        return NextResponse.json({
            totalCompanies,
            totalCustomers,
            rewardsPointsCount,
            stampsResetCount,
            totalPointsDistributed: pointsAggregate._sum.amount ?? 0,
            totalStampsDistributed: stampsAggregate._sum.amount ?? 0,
            customerGrowth,
            growthGranularity: useDaily ? 'day' : 'month',
        });
    } catch {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
