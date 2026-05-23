'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus('success');
                setMessage("Un e-mail vous a été envoyé avec les instructions pour réinitialiser votre mot de passe.");
            } else {
                setStatus('error');
                setMessage("Une erreur est survenue. Veuillez réessayer.");
            }
        } catch (err) {
            setStatus('error');
            setMessage("Impossible de joindre le serveur.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Mot de passe oublié</h1>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Entrez l'adresse e-mail associée à votre compte.
                </p>

                {status === 'success' ? (
                    <div className="text-center">
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
                            {message}
                        </div>
                        <Link href="/login" className="text-black font-bold hover:underline">
                            ← Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {status === 'error' && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                                {message}
                            </div>
                        )}
                        <div>
                            <input 
                                type="email" 
                                placeholder="Votre adresse e-mail"
                                required
                                value={email}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition duration-200 disabled:bg-gray-400"
                        >
                            {status === 'loading' ? "Envoi en cours..." : "Recevoir le lien"}
                        </button>

                        <div className="text-center pt-4">
                            <Link href="/login" className="text-sm text-gray-500 hover:text-black transition">
                                Annuler et retourner à la connexion
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}