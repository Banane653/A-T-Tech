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

type FounderStats = {
    totalCompanies: number;
    totalCustomers: number;
    rewardsPointsCount: number;
    stampsResetCount: number;
    totalPointsDistributed: number;
    totalStampsDistributed: number;
    customerGrowth: GrowthPoint[];
    growthGranularity: 'day' | 'month';
};

function formatNumber(value: number) {
    return new Intl.NumberFormat('fr-FR').format(value);
}

const statCards = [
    {
        key: 'totalCompanies' as const,
        label: 'Commerces actifs',
        subtitle: 'Entreprises inscrites sur la plateforme',
        gradient: 'from-indigo-500/20 to-violet-600/20',
        border: 'border-indigo-500/30',
        titleColor: 'text-indigo-300',
        valueColor: 'text-white',
        subtitleColor: 'text-indigo-200/70',
    },
    {
        key: 'totalCustomers' as const,
        label: 'Utilisateurs de la carte',
        subtitle: 'Clients fidélisés sur tout le SaaS',
        gradient: 'from-violet-500/20 to-purple-600/20',
        border: 'border-violet-500/30',
        titleColor: 'text-violet-300',
        valueColor: 'text-white',
        subtitleColor: 'text-violet-200/70',
    },
    {
        key: 'rewardsPointsCount' as const,
        label: 'Cadeaux (Points)',
        subtitle: 'Récompenses échangées via les points',
        gradient: 'from-fuchsia-500/20 to-pink-600/20',
        border: 'border-fuchsia-500/30',
        titleColor: 'text-fuchsia-300',
        valueColor: 'text-white',
        subtitleColor: 'text-fuchsia-200/70',
    },
    {
        key: 'stampsResetCount' as const,
        label: 'Cartes Tampons',
        subtitle: 'Cartes 10/10 complétées',
        gradient: 'from-rose-500/20 to-red-600/20',
        border: 'border-rose-500/30',
        titleColor: 'text-rose-300',
        valueColor: 'text-white',
        subtitleColor: 'text-rose-200/70',
    },
    {
        key: 'totalPointsDistributed' as const,
        label: 'Points attribués',
        subtitle: 'Programmes système POINTS uniquement',
        gradient: 'from-blue-500/20 to-cyan-600/20',
        border: 'border-blue-500/30',
        titleColor: 'text-blue-300',
        valueColor: 'text-white',
        subtitleColor: 'text-blue-200/70',
    },
    {
        key: 'totalStampsDistributed' as const,
        label: 'Tampons attribués',
        subtitle: 'Programmes système TAMPONS uniquement',
        gradient: 'from-amber-500/20 to-orange-600/20',
        border: 'border-amber-500/30',
        titleColor: 'text-amber-300',
        valueColor: 'text-white',
        subtitleColor: 'text-amber-200/70',
    },
];

export default function FounderHomePage() {
    const [stats, setStats] = useState<FounderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/founder/stats')
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Impossible de charger les statistiques');
                }
                if (data.totalCompanies === undefined) {
                    throw new Error('Données invalides reçues du serveur');
                }
                setStats({
                    totalCompanies: data.totalCompanies,
                    totalCustomers: data.totalCustomers,
                    rewardsPointsCount: data.rewardsPointsCount,
                    stampsResetCount: data.stampsResetCount,
                    totalPointsDistributed: data.totalPointsDistributed,
                    totalStampsDistributed: data.totalStampsDistributed,
                    customerGrowth: data.customerGrowth ?? [],
                    growthGranularity: data.growthGranularity ?? 'month',
                });
            })
            .catch((err: Error) => {
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    const growthLabel =
        stats?.growthGranularity === 'day'
            ? 'Acquisition quotidienne des utilisateurs'
            : 'Acquisition mensuelle des utilisateurs';

    return (
        <div className="p-8 max-w-6xl">
            <h1 className="text-2xl font-bold text-white mb-2">Vue Globale</h1>
            <p className="text-slate-400 mb-8">
                Pilotage stratégique de la plateforme Fidelity Wallet.
            </p>

            {loading ? (
                <p className="text-center text-slate-500 py-16">Chargement des statistiques...</p>
            ) : error ? (
                <div className="bg-red-950/40 border border-red-500/40 text-red-300 rounded-2xl p-6 text-center">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {statCards.map((card) => (
                            <div
                                key={card.key}
                                className={`bg-gradient-to-br ${card.gradient} p-6 rounded-2xl border ${card.border} shadow-lg`}
                            >
                                <p
                                    className={`${card.titleColor} font-semibold uppercase text-xs tracking-wider`}
                                >
                                    {card.label}
                                </p>
                                <p
                                    className={`text-4xl font-extrabold ${card.valueColor} mt-2 tabular-nums`}
                                >
                                    {formatNumber(stats?.[card.key] ?? 0)}
                                </p>
                                <p className={`text-sm ${card.subtitleColor} mt-2`}>{card.subtitle}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-2xl border border-indigo-900/40 shadow-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-1">
                            Croissance globale de la base clients
                        </h2>
                        <p className="text-sm text-slate-400 mb-6">{growthLabel}</p>

                        {stats?.customerGrowth.length === 0 ? (
                            <p className="text-center text-slate-500 py-12">
                                Pas encore assez de données pour afficher le graphique.
                            </p>
                        ) : (
                            <div className="w-full h-80 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={stats?.customerGrowth}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="founderGrowthGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.45} />
                                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                            axisLine={{ stroke: '#475569' }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                                            axisLine={{ stroke: '#475569' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                borderRadius: '12px',
                                                border: '1px solid #4f46e5',
                                                color: '#e2e8f0',
                                            }}
                                            formatter={(value) => [
                                                formatNumber(Number(value)),
                                                'Total clients',
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="totalCustomers"
                                            name="totalCustomers"
                                            stroke="#8b5cf6"
                                            strokeWidth={2.5}
                                            fill="url(#founderGrowthGradient)"
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
