'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Palette, Gift, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SetupWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { locale } = useParams();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Les données du formulaire
    const [formData, setFormData] = useState({
        systemType: 'STAMPS',
        cardTemplate: 'default',
        primaryColor: '#000000',
        logoUrl: '',
    });

    // Si on arrive ici sans session Stripe, on renvoie à l'accueil
    useEffect(() => {
        if (!sessionId) {
            router.push('/');
        }
    }, [sessionId, router]);

    const handleComplete = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, sessionId }),
            });

            if (res.ok) {
                // Configuration terminée ! On redirige vers la page de connexion
                router.push(`/${locale}/login?setup=success`);
            } else {
                console.error("Erreur lors de l'enregistrement");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (!sessionId) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                
                {/* Barre de progression */}
                <div className="flex items-center justify-center mb-8 space-x-4">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        Programme
                    </div>
                    <div className="w-12 h-1 bg-gray-200 rounded">
                        <div className={`h-full bg-black rounded transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        Design
                    </div>
                </div>

                <div className="bg-white py-10 px-6 shadow-xl sm:rounded-3xl sm:px-12 border border-gray-100">
                    
                    {/* ÉTAPE 1 : CHOIX DU PROGRAMME */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900">Choisissez votre système</h2>
                                <p className="mt-2 text-gray-600">Comment souhaitez-vous récompenser vos clients ?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Option Tampons */}
                                <div 
                                    onClick={() => setFormData({ ...formData, systemType: 'STAMPS' })}
                                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.systemType === 'STAMPS' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-black text-white rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
                                        <div className={`w-6 h-6 rounded-full border-2 ${formData.systemType === 'STAMPS' ? 'border-black bg-black' : 'border-gray-300'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Carte à tampons</h3>
                                    <p className="text-gray-500 text-sm">Le grand classique. Ex: 10 tampons = 1 café offert. Simple et redoutablement efficace.</p>
                                </div>

                                {/* Option Points */}
                                <div 
                                    onClick={() => setFormData({ ...formData, systemType: 'POINTS' })}
                                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.systemType === 'POINTS' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-black text-white rounded-xl"><Gift className="w-6 h-6" /></div>
                                        <div className={`w-6 h-6 rounded-full border-2 ${formData.systemType === 'POINTS' ? 'border-black bg-black' : 'border-gray-300'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Système de points</h3>
                                    <p className="text-gray-500 text-sm">Plus flexible. Ex: 1€ dépensé = 1 point. Permet de créer un catalogue de récompenses variées.</p>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button 
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition"
                                >
                                    Suivant <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ÉTAPE 2 : DESIGN */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900">Votre identité visuelle</h2>
                                <p className="mt-2 text-gray-600">Personnalisez l'apparence de votre carte digitale.</p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <Palette className="w-5 h-5" /> Couleur principale
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="w-16 h-16 rounded cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primaryColor.toUpperCase()}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none uppercase font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Lien de votre logo (URL)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://mon-site.com/logo.png"
                                        value={formData.logoUrl}
                                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Nous pourrons modifier cela plus tard si vous n'avez pas de lien sous la main.</p>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-between">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-gray-500 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Retour
                                </button>
                                <button 
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Terminer
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}