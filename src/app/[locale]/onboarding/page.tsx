'use client';

import { useState } from 'react';
import { useRouter } from '@/navigation'; // Utilisation de ton router personnalisé avec les locales
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2, CreditCard } from 'lucide-react';

export default function OnboardingPage() {
    const t = useTranslations('Onboarding');
    const router = useRouter();
    const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        vatNumber: '',
        name: '',
        username: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, plan }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t('errors.default'));
                setLoading(false);
                return;
            }

            // Redirection vers la page de paiement sécurisée de Stripe
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError(t('errors.serverError'));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="mt-6 text-3xl font-black text-gray-900">{t('title')}</h2>
                <p className="mt-2 text-sm text-gray-600">
                    {t('subtitle')}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
                    
                    {/* Toggle Mensuel / Annuel */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                            <button
                                type="button"
                                onClick={() => setPlan('monthly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    plan === 'monthly' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {t('plans.monthly')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlan('yearly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    plan === 'yearly' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {t('plans.yearly')} <span className="ml-1 text-xs text-green-400">{t('plans.discount')}</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fields.companyName')}</label>
                                <input
                                    required
                                    type="text"
                                    placeholder={t('placeholders.companyName')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-black"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fields.vatNumber')}</label>
                                <input
                                    type="text"
                                    placeholder={t('placeholders.vatNumber')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-black"
                                    value={formData.vatNumber}
                                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Bloc Nom & Username */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fields.name')}</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-black"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fields.username')}</label>
                                <input
                                    type="text"
                                    placeholder={t('placeholders.username')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-black"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Bloc Email & Mot de passe */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fields.email')}</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-black"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('fields.password')}</label>
                                <input
                                    required
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition text-black"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <ul className="text-sm text-gray-500 space-y-2 py-2">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('perks.freeTrial')}</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t('perks.cancelAnytime')}</li>
                        </ul>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                            {loading ? t('buttons.loading') : t('buttons.submit')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}