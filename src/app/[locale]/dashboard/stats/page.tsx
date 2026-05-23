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

function formatNumber(value: number) {
    return new Intl.NumberFormat('fr-FR').format(value);
}

export default function StatsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

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
            ? 'Évolution quotidienne des inscriptions'
            : 'Évolution mensuelle des inscriptions';

    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Statistiques</h1>
            <p className="text-gray-500 mb-8">
                Vue d&apos;ensemble de la performance de votre programme de fidélité.
            </p>

            {loading ? (
                <p className="text-center text-gray-400 py-16">Chargement...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm">
                            <p className="text-blue-600 font-semibold uppercase text-xs tracking-wider">
                                Points distribués
                            </p>
                            <p className="text-4xl font-extrabold text-blue-900 mt-2 tabular-nums">
                                {formatNumber(stats?.totalPointsDistributed ?? 0)}
                            </p>
                            <p className="text-sm text-blue-700/80 mt-2">Cumul de tous les gains clients</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border border-amber-200 shadow-sm">
                            <p className="text-amber-700 font-semibold uppercase text-xs tracking-wider">
                                Cadeaux offerts
                            </p>
                            <p className="text-4xl font-extrabold text-amber-900 mt-2 tabular-nums">
                                {formatNumber(stats?.totalGiftsOffered ?? 0)}
                            </p>
                            <p className="text-sm text-amber-800/80 mt-2">
                                Échanges et cartes complétées
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl border border-emerald-200 shadow-sm">
                            <p className="text-emerald-700 font-semibold uppercase text-xs tracking-wider">
                                Total clients
                            </p>
                            <p className="text-4xl font-extrabold text-emerald-900 mt-2 tabular-nums">
                                {formatNumber(stats?.totalCustomers ?? 0)}
                            </p>
                            <p className="text-sm text-emerald-800/80 mt-2">Cartes actives dans votre base</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Croissance de la base clients</h2>
                        <p className="text-sm text-gray-500 mb-6">{growthLabel}</p>

                        {stats?.customerGrowth.length === 0 ? (
                            <p className="text-center text-gray-400 py-12">
                                Pas encore assez de données pour afficher le graphique.
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
                                                        ? 'Total clients'
                                                        : 'Nouveaux clients';
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
