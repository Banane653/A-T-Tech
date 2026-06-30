'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function MarketingPage() {
    const t = useTranslations('MerchantMarketing');
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string>('Votre Commerce');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [notifiedCount, setNotifiedCount] = useState(0);

    // Récupération de l'ID du commerce au chargement de la page
    useEffect(() => {
        fetch('/api/admin/company')
            .then((res) => res.json())
            .then((data) => {
                console.log("🧐 Réponse de l'API Company :", data); // 👈 AJOUTE CETTE LIGNE
                if (data.company) {
                    setCompanyId(data.company.id);
                    setCompanyName(data.company.name);
                }
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId || !title || !message) return;

        setStatus('loading');

        try {
            const res = await fetch('/api/admin/marketing/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId, title, message }),
            });

            if (res.ok) {
                const data = await res.json();
                setNotifiedCount(data.notifiedCount || 0);
                setStatus('success');
                setTitle('');
                setMessage('');
                
                // On remet le formulaire à zéro après 5 secondes
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 4000);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-gray-500">{t('subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('form.titleLabel')}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('form.titlePlaceholder')}
                                maxLength={30}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('form.messageLabel')}
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('form.messagePlaceholder')}
                                rows={4}
                                maxLength={120}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition resize-none"
                            />
                            <p className="text-right text-xs text-gray-400 mt-2">
                                {message.length}/120
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || !title || !message || !companyId}
                            className={`w-full py-3.5 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2
                                ${status === 'loading' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                                  status === 'success' ? 'bg-green-500 text-white' :
                                  status === 'error' ? 'bg-red-500 text-white' :
                                  'bg-black text-white hover:bg-gray-800'
                                }`}
                        >
                            {status === 'loading' && (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {status === 'idle' && t('form.sendBtn')}
                            {status === 'loading' && t('form.sending')}
                            {status === 'success' && t('form.success')}
                            {status === 'error' && t('form.error')}
                        </button>
                        
                        {status === 'success' && (
                            <p className="text-center text-sm font-medium text-green-600 mt-4">
                                🎉 {notifiedCount} clients ont reçu la notification !
                            </p>
                        )}
                    </form>
                </div>

                {/* COLONNE DROITE : APERÇU (VISUEL TÉLÉPHONE) */}
                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider text-center">
                        {t('previewTitle')}
                    </p>
                    
                    {/* Fausse bulle de notification iOS */}
                    <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/40 transform transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shrink-0">
                                <span className="text-white text-xs">🍏</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-900 opacity-60 flex justify-between">
                                    <span>{companyName}</span>
                                    <span>Maintenant</span>
                                </p>
                            </div>
                        </div>
                        <div className="pl-11">
                            <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                                {title || t('form.titlePlaceholder')}
                            </p>
                            <p className="text-sm text-gray-800 leading-snug">
                                {message || t('form.messagePlaceholder')}
                            </p>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-6 text-center max-w-xs">
                        {t('previewDisclaimer')}
                    </p>
                </div>
            </div>
        </div>
    );
}