'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer'; // Ton composant Footer global

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // Appel à notre future API
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', company: '', message: '' }); // Reset
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans text-gray-900">
            {/* Navbar basique pour pouvoir revenir à l'accueil */}
            <header className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
                <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition">
                    A-T-TECH.
                </Link>
                <Link href="/" className="text-sm font-medium text-gray-500 hover:text-black transition">
                    ← Retour à l'accueil
                </Link>
            </header>

            {/* Contenu principal */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    
                    {/* Décoration subtile */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10"></div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-3">Contactez-nous</h1>
                        <p className="text-gray-500 text-sm">
                            Une question sur nos tarifs ? Besoin d'une démo pour votre commerce ? Laissez-nous un message et nous vous répondrons rapidement.
                        </p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center animate-fade-in">
                            <div className="text-4xl mb-2">✅</div>
                            <h3 className="font-bold text-lg mb-1">Message envoyé !</h3>
                            <p className="text-sm">Merci pour votre message. Nous vous recontacterons très vite.</p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-sm font-semibold text-green-700 hover:underline"
                            >
                                Envoyer un autre message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Nom complet</label>
                                    <input 
                                        type="text" id="name" required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                        placeholder="Jean Dupont"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email</label>
                                    <input 
                                        type="email" id="email" required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                        placeholder="jean@commerce.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="company" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Nom du commerce (Optionnel)</label>
                                <input 
                                    type="text" id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    placeholder="Café Lumière"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-xs font-bold text-gray-700 uppercase tracking-wide">Votre message</label>
                                <textarea 
                                    id="message" required rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition resize-none"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                ></textarea>
                            </div>

                            {status === 'error' && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                    ❌ Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                                </p>
                            )}

                            <button 
                                type="submit" 
                                disabled={status === 'loading'}
                                className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <span className="animate-pulse">Envoi en cours...</span>
                                ) : (
                                    "Envoyer le message"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}