'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token'); // Récupère le ?token=... dans l'URL
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Si quelqu'un arrive sur cette page sans jeton dans l'URL
    if (!token) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4 font-semibold">Aucun jeton de sécurité trouvé.</p>
                <Link href="/login" className="text-black font-bold hover:underline">Retourner à la connexion</Link>
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
                setMessage("Votre mot de passe a été modifié avec succès !");
                // On redirige vers la page de login après 3 secondes
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || "Une erreur est survenue.");
            }
        } catch (err) {
            setStatus('error');
            setMessage("Impossible de joindre le serveur.");
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                    {message}
                </div>
                <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
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
                <label className="text-sm text-gray-600 ml-1 mb-1 block">Nouveau mot de passe</label>
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
                {status === 'loading' ? "Modification..." : "Enregistrer"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Nouveau mot de passe</h1>
                {/* Suspense est requis par Next.js quand on utilise useSearchParams() */}
                <Suspense fallback={<p className="text-center text-gray-500">Chargement...</p>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}