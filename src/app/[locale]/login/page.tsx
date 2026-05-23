'use client';

import { useState } from 'react';
import { useRouter, Link } from '@/navigation'; // Utilisation de nos imports personnalisés
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const t = useTranslations('Login');

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.role === 'FOUNDER') {
                    router.push('/founder');
                } else if (data.role === 'ADMIN') {
                    router.push('/dashboard');
                } else {
                    router.push('/scanner');
                }
            } else {
                // Pour les messages d'erreur venant de l'API, c'est plus compliqué à traduire directement,
                // mais on peut traduire le message générique en cas de fallback.
                setError(data.error || t('errors.invalidCredentials'));
            }
        } catch (err) {
            setError(t('errors.serverError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('title')}</h1>
                <p className="text-center text-gray-500 mb-8">{t('subtitle')}</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 ml-1 mb-1 block">{t('fields.identifier')}</label>
                        <input 
                            type="text"
                            required
                            value={identifier}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="text-sm text-gray-600 ml-1 mb-1 block">{t('fields.password')}</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-start">
                         <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black">
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition duration-200 mt-4 disabled:bg-gray-400"
                    >
                        {loading ? t('buttons.loading') : t('buttons.submit')}
                    </button>
                </form>
            </div>
        </main>
    );
}