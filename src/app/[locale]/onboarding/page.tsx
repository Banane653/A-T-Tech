'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Building2, CreditCard } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        vatNumber: '',
        name: '',
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
                setError(data.error || "Une erreur est survenue");
                setLoading(false);
                return;
            }

            // Redirection vers la page de paiement sécurisée de Stripe
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError("Impossible de contacter le serveur.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="mt-6 text-3xl font-black text-gray-900">Créez votre commerce</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Démarrez votre programme de fidélité en 2 minutes.
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
                                Mensuel (10€/mois)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPlan('yearly')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    plan === 'yearly' ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Annuel (100€/an) <span className="ml-1 text-xs text-green-400">(-16%)</span>
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
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom du commerce *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Le Petit Bistrot"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Numéro de TVA (Optionnel)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: BE0123456789"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    value={formData.vatNumber}
                                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Votre Nom *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email pro *</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe *</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <ul className="text-sm text-gray-500 space-y-2 py-2">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Essai gratuit & Factures automatiques</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Annulable à tout moment</li>
                        </ul>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-lg font-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                            Continuer vers le paiement
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}