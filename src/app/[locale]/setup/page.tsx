'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
// Nouveaux imports Lucide pour les icônes des tampons
import { Loader2, Palette, Gift, CheckCircle2, ArrowRight, ArrowLeft, Star, Coffee, Pizza, Sparkles } from 'lucide-react';

export default function SetupWizard() {
    const t = useTranslations('Setup');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useParams();
    const sessionId = searchParams.get('session_id');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Ajout de cardTemplate avec 'stamps_stars' par défaut
    const [formData, setFormData] = useState({
        systemType: 'STAMPS',
        cardTemplate: 'stamps_stars',
        primaryColor: '#000000',
        logoUrl: '',
    });

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
                
                <div className="flex items-center justify-center mb-8 space-x-4">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        {t('steps.program')}
                    </div>
                    <div className="w-12 h-1 bg-gray-200 rounded">
                        <div className={`h-full bg-black rounded transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black font-bold' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        {t('steps.design')}
                    </div>
                </div>

                <div className="bg-white py-10 px-6 shadow-xl sm:rounded-3xl sm:px-12 border border-gray-100">
                    
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900">{t('step1.title')}</h2>
                                <p className="mt-2 text-gray-600">{t('step1.subtitle')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div 
                                    onClick={() => setFormData({ ...formData, systemType: 'STAMPS', cardTemplate: 'stamps_stars' })}
                                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.systemType === 'STAMPS' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-black text-white rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
                                        <div className={`w-6 h-6 rounded-full border-2 ${formData.systemType === 'STAMPS' ? 'border-black bg-black' : 'border-gray-300'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-black">{t('step1.stamps.title')}</h3>
                                    <p className="text-gray-500 text-sm">{t('step1.stamps.description')}</p>
                                </div>

                                <div 
                                    onClick={() => setFormData({ ...formData, systemType: 'POINTS', cardTemplate: 'points_default' })}
                                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.systemType === 'POINTS' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-black text-white rounded-xl"><Gift className="w-6 h-6" /></div>
                                        <div className={`w-6 h-6 rounded-full border-2 ${formData.systemType === 'POINTS' ? 'border-black bg-black' : 'border-gray-300'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-black">{t('step1.points.title')}</h3>
                                    <p className="text-gray-500 text-sm">{t('step1.points.description')}</p>
                                </div>
                            </div>

                            {/* 🔥 Le sous-menu magique des tampons */}
                            {formData.systemType === 'STAMPS' && (
                                <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h4 className="text-lg font-bold mb-4 text-center text-black">{t('step1.templatesTitle')}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {[
                                            { id: 'stamps_stars', name: t('step1.templates.stamps_stars'), icon: Star },
                                            { id: 'stamps_coffee', name: t('step1.templates.stamps_coffee'), icon: Coffee },
                                            { id: 'stamps_pizza', name: t('step1.templates.stamps_pizza'), icon: Pizza },
                                            { id: 'stamps_gift', name: t('step1.templates.stamps_gift'), icon: Gift },
                                            { id: 'stamps_nails', name: t('step1.templates.stamps_nails'), icon: Sparkles },
                                        ].map((tpl) => (
                                            <div 
                                                key={tpl.id}
                                                onClick={() => setFormData({ ...formData, cardTemplate: tpl.id })}
                                                className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.cardTemplate === tpl.id ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <tpl.icon className={`w-8 h-8 mb-2 ${formData.cardTemplate === tpl.id ? 'text-black' : 'text-gray-400'}`} />
                                                <span className={`text-xs font-bold text-center ${formData.cardTemplate === tpl.id ? 'text-black' : 'text-gray-500'}`}>{tpl.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex justify-end">
                                <button 
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition"
                                >
                                    {t('buttons.next')} <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-gray-900">{t('step2.title')}</h2>
                                <p className="mt-2 text-gray-600">{t('step2.subtitle')}</p>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <Palette className="w-5 h-5" /> {t('step2.primaryColor')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="w-16 h-16 rounded cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primaryColor.toUpperCase()}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none uppercase font-mono text-black"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        {t('step2.logoUrl')}
                                    </label>
                                    <input
                                        type="url"
                                        placeholder={t('step2.logoPlaceholder')}
                                        value={formData.logoUrl}
                                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none text-black"
                                    />
                                </div>
                            </div>

                            <div className="mt-10 flex justify-between">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-gray-500 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition"
                                >
                                    <ArrowLeft className="w-5 h-5" /> {t('buttons.back')}
                                </button>
                                <button 
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    {t('buttons.finish')}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}