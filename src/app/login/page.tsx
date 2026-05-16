'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Le routeur de Next.js pour nous téléporter vers la bonne page
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // 🚀 REDIRECTION INTELLIGENTE SELON LE RÔLE
                if (data.role === 'FOUNDER') {
                    router.push('/founder');
                } else if (data.role === 'ADMIN') {
                    router.push('/dashboard');
                } else {
                    router.push('/scanner'); // Par défaut, l'employé
                }
            } else {
                // Si le mot de passe est faux
                setError(data.error || "Identifiants incorrects");
            }
        } catch (err) {
            setError("Impossible de joindre le serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Espace Commerçant</h1>
                <p className="text-center text-gray-500 mb-8">Connectez-vous à votre tableau de bord</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 ml-1 mb-1 block">Adresse Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="text-sm text-gray-600 ml-1 mb-1 block">Mot de passe</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition duration-200 mt-4 disabled:bg-gray-400"
                    >
                        {loading ? "Connexion en cours..." : "Se connecter"}
                    </button>
                </form>
            </div>
        </main>
    );
}