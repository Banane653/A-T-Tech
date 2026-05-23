'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/navigation'; // Utilisation de nos imports personnalisés
import { useTranslations } from 'next-intl';

function ResetPasswordForm() {
    const t = useTranslations('ResetPassword');
    const searchParams = useSearchParams();
    const token = searchParams.get('token'); 
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!token) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4 font-semibold">{t('errors.noToken')}</p>
                <Link href="/login" className="text-black font-bold hover:underline">
                    {t('backToLogin')}
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(t('success.message'));
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || t('errors.generic'));
            }
        } catch (err) {
            setStatus('error');
            setMessage(t('errors.serverConnection'));
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                    {message}
                </div>
                <p className="text-sm text-gray-500">{t('success.redirect')}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {message}
                </div>
            )}
            
            <div>
                <label className="text-sm text-gray-600 ml-1 mb-1 block">{t('fields.newPassword')}</label>
                <input 
                    type="password" 
                    required
                    minLength={6}
                    value={newPassword}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition duration-200 disabled:bg-gray-400"
            >
                {status === 'loading' ? t('buttons.loading') : t('buttons.submit')}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    const t = useTranslations('ResetPassword');
    
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('title')}</h1>
                <Suspense fallback={<p className="text-center text-gray-500">{t('loading')}</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}