'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Reward = { id: string; name: string; cost: number };

export default function RewardsPage() {
    const t = useTranslations('MerchantRewards');
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchRewards = async () => {
        const res = await fetch('/api/admin/rewards');
        if (res.ok) {
            const data = await res.json();
            setRewards(data.rewards);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/admin/rewards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, cost: Number(cost) }),
        });
        if (res.ok) {
            setName('');
            setCost('');
            fetchRewards();
        } else {
            const data = await res.json();
            alert(`${t('alerts.error')} ${data.error}`);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('alerts.confirmDelete'))) return;
        const res = await fetch('/api/admin/rewards', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) fetchRewards();
        else {
            const data = await res.json();
            alert(`${t('alerts.error')} ${data.error}`);
        }
    };

    return (
        <div className="p-8 max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-500 mb-8">{t('subtitle')}</p>

            <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 mb-8">
                <h2 className="font-bold text-gray-800">{t('form.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder={t('form.namePlaceholder')}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 border border-gray-200 rounded-lg text-black"
                    />
                    <input
                        type="number"
                        placeholder={t('form.costPlaceholder')}
                        required
                        min={1}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="p-3 border border-gray-200 rounded-lg text-black"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? t('form.loadingBtn') : t('form.submitBtn')}
                </button>
            </form>

            <div className="space-y-3">
                {rewards.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">{t('list.empty')}</p>
                ) : (
                    rewards.map((reward) => (
                        <div
                            key={reward.id}
                            className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between"
                        >
                            <div>
                                <p className="font-bold text-gray-800">{reward.name}</p>
                                <p className="text-sm text-blue-600 font-semibold">{reward.cost} {t('list.pointsLabel')}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(reward.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1"
                            >
                                {t('list.deleteBtn')}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}