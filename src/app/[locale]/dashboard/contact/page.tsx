'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function DashboardContactPage() {
    // On réutilise ton dictionnaire "Contact" de la page publique
    const t = useTranslations('Contact'); 
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // 🪄 MAGIE : Pré-remplissage automatique des données
    useEffect(() => {
        const fetchPreFillData = async () => {
            try {
                // 1. On récupère le nom de l'entreprise
                const resCompany = await fetch('/api/admin/employees');
                if (resCompany.ok) {
                    const dataCompany = await resCompany.json();
                    if (dataCompany.company && dataCompany.company.name) {
                        setFormData(prev => ({ ...prev, company: dataCompany.company.name || '' }));
                    }
                }

                // 2. On demande au serveur "Qui est connecté actuellement ?"
                const resMe = await fetch('/api/admin/me');
                if (resMe.ok) {
                    const dataMe = await resMe.json();
                    if (dataMe.user) {
                        setFormData(prev => ({ 
                            ...prev, 
                            name: dataMe.user.name || '', 
                            email: dataMe.user.email || '' 
                        }));
                    }
                }
            } catch (error) {
                console.error("Erreur lors du pré-remplissage du formulaire", error);
            }
        };

        fetchPreFillData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                // On garde le nom, email et company pré-remplis, on vide juste le message
                setFormData(prev => ({ ...prev, message: '' })); 
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('dashboard.title')}</h1>
                
                <p className="text-gray-500">{t('dashboard.subtitle')}</p>
            </div>

            {/* 👇 BLOC CONTACT DIRECT 👇 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <a href="tel:+32484344121" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-black transition group">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl group-hover:bg-black group-hover:text-white transition">
                        📞
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.phoneLabel')}</p>
                        <p className="text-lg font-bold text-gray-900">+32 484 34 41 21</p>
                    </div>
                </a>

                <a href="mailto:contact@cardeo.be" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-black transition group">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl group-hover:bg-black group-hover:text-white transition">
                        ✉️
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.emailLabel')}</p>
                        <p className="text-lg font-bold text-gray-900">contact@cardeo.be</p>
                    </div>
                </a>
            </div>

            {/* 👇 FORMULAIRE PRÉ-REMPLI 👇 */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold mb-6">{t('dashboard.formTitle')}</h2>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center animate-fade-in">
                        <div className="text-4xl mb-2">✅</div>
                        <h3 className="font-bold text-lg mb-1">{t('success.title')}</h3>
                        <p className="text-sm">{t('success.desc')}</p>
                        <button 
                            onClick={() => setStatus('idle')}
                            className="mt-6 text-sm font-semibold text-green-700 hover:underline"
                        >
                            {t('success.btnAgain')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                    {t('form.nameLabel')}
                                </label>
                                <input 
                                    type="text" id="name" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition text-gray-700"
                                    placeholder={t('form.namePlaceholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                    {t('form.emailLabel')}
                                </label>
                                <input 
                                    type="email" id="email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition text-gray-700"
                                    placeholder={t('form.emailPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="company" className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                {t('form.companyLabel')}
                            </label>
                            <input 
                                type="text" id="company"
                                value={formData.company}
                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition text-gray-700"
                                placeholder={t('form.companyPlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                {t('form.messageLabel')}
                            </label>
                            <textarea 
                                id="message" required rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition resize-none text-gray-700"
                                placeholder={t('form.messagePlaceholder')}
                            ></textarea>
                        </div>

                        {status === 'error' && (
                            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                {t('error')}
                            </p>
                        )}

                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {status === 'loading' ? (
                                <span className="animate-pulse">{t('submit.loading')}</span>
                            ) : (
                                t('submit.default')
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}