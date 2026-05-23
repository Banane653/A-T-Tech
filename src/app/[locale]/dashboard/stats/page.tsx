'use client';

import { useState, useEffect } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useTranslations, useLocale } from 'next-intl';

type GrowthPoint = {
    label: string;
    newCustomers: number;
    totalCustomers: number;
};

type StatsData = {
    totalPointsDistributed: number;
    totalGiftsOffered: number;
    totalCustomers: number;
    customerGrowth: GrowthPoint[];
    growthGranularity: 'day' | 'month';
};

export default function StatsPage() {
    const t = useTranslations('MerchantStats');
    const locale = useLocale();
    
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fonction de formatage dynamique selon la langue
    const formatNumber = (value: number) => {
        return new Intl.NumberFormat(locale).format(value);
    };

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((res) => res.json())
            .then((data) => {
                if (data.totalCustomers !== undefined) {
                    setStats({
                        totalPointsDistributed: data.totalPointsDistributed,
                        totalGiftsOffered: data.totalGiftsOffered,
                        totalCustomers: data.totalCustomers,
                        customerGrowth: data.customerGrowth ?? [],
                        growthGranularity: data.growthGranularity ?? 'month',
                    });
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const growthLabel =
        stats?.growthGranularity === 'day'
            ? t('chart.labelDay')
            : t('chart.labelMonth');

    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('header.title')}</h1>
            <p className="text-gray-500 mb-8">
                {t('header.subtitle')}
            </p>

            {loading ? (
                <p className="text-center text-gray-400 py-16">{t('loading')}</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
                            <p className="text-blue-600 font-semibold uppercase text-xs tracking-wider">
                                {t('cards.points.label')}
                            </p>
                            <p className="text-4xl font-extrabold text-blue-900 mt-2 tabular-nums">
                                {formatNumber(stats?.totalPointsDistributed ?? 0)}
                            </p>
                            <p className="text-sm text-blue-700/80 mt-2">
                                {t('cards.points.desc')}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border border-amber-200 shadow-sm">
                            <p className="text-amber-700 font-semibold uppercase text-xs tracking-wider">
                                {t('cards.gifts.label')}
                            </p>
                            <p className="text-4xl font-extrabold text-amber-900 mt-2 tabular-nums">
                                {formatNumber(stats?.totalGiftsOffered ?? 0)}
                            </p>
                            <p className="text-sm text-amber-800/80 mt-2">
                                {t('cards.gifts.desc')}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl border border-emerald-200 shadow-sm">
                            <p className="text-emerald-700 font-semibold uppercase text-xs tracking-wider">
                                {t('cards.customers.label')}
                            </p>
                            <p className="text-4xl font-extrabold text-emerald-900 mt-2 tabular-nums">
                                {formatNumber(stats?.totalCustomers ?? 0)}
                            </p>
                            <p className="text-sm text-emerald-800/80 mt-2">
                                {t('cards.customers.desc')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{t('chart.title')}</h2>
                        <p className="text-sm text-gray-500 mb-6">{growthLabel}</p>

                        {stats?.customerGrowth.length === 0 ? (
                            <p className="text-center text-gray-400 py-12">
                                {t('chart.noData')}
                            </p>
                        ) : (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats?.customerGrowth}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            axisLine={{ stroke: '#e5e7eb' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            }}
                                            formatter={(value, name) => {
                                                const label =
                                                    name === 'totalCustomers'
                                                        ? t('chart.tooltipTotal')
                                                        : t('chart.tooltipNew');
                                                return [formatNumber(Number(value)), label];
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="totalCustomers"
                                            name="totalCustomers"
                                            stroke="#2563eb"
                                            strokeWidth={2.5}
                                            fill="url(#colorClients)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}