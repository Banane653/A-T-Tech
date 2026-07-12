'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs de rendu serveur (SSR) avec Leaflet
const MapPreview = dynamic(() => import('@/components/MapPreview'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-48 mt-3 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center border border-gray-200">
            <span className="text-sm font-semibold text-gray-400">Chargement de la carte...</span>
        </div>
    )
});

type TabType = 'flash' | 'proximity';

export default function MarketingPage() {
    const t = useTranslations('MerchantMarketing');
    
    // États communs
    const [activeTab, setActiveTab] = useState<TabType>('flash');
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string>('Votre Commerce');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [address, setAddress] = useState('');
    const [geoError, setGeoError] = useState<string | null>(null);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);

    // États Onglet 1 : Campagne Flash
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notifiedCount, setNotifiedCount] = useState(0);

    // États Onglet 2 : Proximity GPS
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [proximityText, setProximityText] = useState('');

    // Récupération des données d'entreprise
    useEffect(() => {
        fetch('/api/admin/company')
            .then((res) => res.json())
            .then((data) => {
                if (data.company) {
                    setCompanyId(data.company.id);
                    setCompanyName(data.company.name);
                    setCompanyLogo(data.company.logoUrl);
                    if (data.company.latitude) setLatitude(String(data.company.latitude));
                    if (data.company.longitude) setLongitude(String(data.company.longitude));
                    if (data.company.proximityText) setProximityText(data.company.proximityText);
                    if (data.company.address) setAddress(data.company.address);
                }
            })
            .catch(console.error);
    }, []);

    // Envoi de la Campagne Flash (Push Instantané)
    const handleSendFlash = async (e: React.FormEvent) => {
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
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 4000);
            }
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    // Enregistrement de la configuration GPS Proximité
    const handleSaveProximity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId || !latitude || !longitude || !proximityText) return;
        setStatus('loading');

        try {
            const res = await fetch('/api/admin/company', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    isGpsUpdate: true, 
                    latitude, 
                    longitude, 
                    proximityText 
                }),
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => setStatus('idle'), 4000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 4000);
            }
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    const handleSearchAddress = async () => {
        if (!address.trim()) return;
        setIsSearchingAddress(true);
        setGeoError(null);
    
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await res.json();
    
            if (data && data.length > 0) {
                setLatitude(data[0].lat);
                setLongitude(data[0].lon);
                setStatus('idle'); 
            } else {
                setGeoError(t('gps.notFound')); // 👈 Message d'erreur traduit
            }
        } catch (err) {
            setGeoError(t('gps.searchError')); // 👈 Message d'erreur réseau traduit
        } finally {
            setIsSearchingAddress(false);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-gray-500">{t('subtitle')}</p>
            </div>

            {/* SYSTÈME D'ONGLETS STYLISÉ TAILWIND */}
            <div className="flex border-b border-gray-200 mb-8 gap-4">
                <button
                    onClick={() => { setActiveTab('flash'); setStatus('idle'); }}
                    className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${
                        activeTab === 'flash' 
                            ? 'border-black text-black' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    ⚡️ {t('tabs.flash')}
                </button>
                <button
                    onClick={() => { setActiveTab('proximity'); setStatus('idle'); }}
                    className={`py-3 px-4 font-semibold text-sm transition-all border-b-2 outline-none ${
                        activeTab === 'proximity' 
                            ? 'border-black text-black' 
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    📍 {t('tabs.proximity')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* COLONNE GAUCHE : FORMULAIRES INTERCHANGEABLES */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
                    
                    {activeTab === 'flash' ? (
                        /* FORMULAIRE 1 : CAMPAGNE FLASH */
                        <form onSubmit={handleSendFlash} className="space-y-6">
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
                                <p className="text-xs text-gray-400 mt-2">{t('form.titleHint')}</p>
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
                                <p className="text-right text-xs text-gray-400 mt-2">{message.length}/120</p>
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
                                {status === 'loading' && <span className="animate-spin mr-2">⏳</span>}
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
                    ) : (
                        /* FORMULAIRE 2 : GPS GEOFENCING PROXIMITÉ */
                        <form onSubmit={handleSaveProximity} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('gps.addressLabel')}
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder={t('gps.addressPlaceholder')}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearchAddress}
                                        disabled={isSearchingAddress || !address}
                                        className="px-5 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {isSearchingAddress ? t('gps.searchLoading') : t('gps.searchBtn')}
                                    </button>
                                </div>
                                
                                {/* Message d'erreur dynamique et traduit */}
                                {geoError && (
                                    <p className="text-xs text-red-500 mt-2 font-medium">⚠️ {geoError}</p>
                                )}

                                {/* Indicateur de succès traduit */}
                                {latitude && longitude && !geoError && (
                                    <p className="text-xs text-green-600 mt-2 font-medium">
                                        ✅ {t('gps.searchSuccess')} (Lat: {Number(latitude).toFixed(4)}, Lng: {Number(longitude).toFixed(4)})
                                    </p>
                                )}
                                {/* LA CARTE MAGIQUE */}
                                {latitude && longitude && !geoError && (
                                    <MapPreview latitude={Number(latitude)} longitude={Number(longitude)} />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('gps.messageLabel')}
                                </label>
                                <textarea
                                    value={proximityText}
                                    onChange={(e) => setProximityText(e.target.value)}
                                    placeholder={t('gps.messagePlaceholder')}
                                    rows={4}
                                    maxLength={100}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition resize-none"
                                />
                                <p className="text-right text-xs text-gray-400 mt-2">{proximityText.length}/100</p>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading' || !latitude || !longitude || !proximityText || !companyId}
                                className={`w-full py-3.5 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2
                                    ${status === 'loading' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                                      status === 'success' ? 'bg-green-500 text-white' :
                                      status === 'error' ? 'bg-red-500 text-white' :
                                      'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                {status === 'loading' && <span className="animate-spin mr-2">⏳</span>}
                                {status === 'idle' && t('gps.saveBtn')}
                                {status === 'loading' && t('gps.saving')}
                                {status === 'success' && t('gps.saved')}
                                {status === 'error' && t('form.error')}
                            </button>
                        </form>
                    )}
                </div>

                {/* COLONNE DROITE : LE TÉLÉPHONE ADAPTATIF */}
                <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                    <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider text-center">
                        {t('previewTitle')}
                    </p>
                    
                    {/* Bulle de notification iOS */}
                    <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/40 transform transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Logo dynamique ou fallback */}
                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-sm">
                                {companyLogo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-xs font-bold">{companyName.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-900 opacity-60 flex justify-between">
                                    <span>{companyName || t('previewFallbackName')}</span>
                                    {/* Petit badge différent selon l'onglet */}
                                    <span className="text-blue-600 font-medium">
                                        {activeTab === 'flash' ? 'Maintenant' : '📍 À proximité'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="pl-11">
                            {activeTab === 'flash' ? (
                                <>
                                    <p className="text-sm text-gray-800 leading-snug">
                                        {message || t('form.messagePlaceholder')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    {/* Comportement Geofencing : Pas de titre de promo, juste le texte GPS direct */}
                                    <p className="text-sm text-gray-900 leading-snug font-medium">
                                        {proximityText || t('gps.messagePlaceholder')}
                                    </p>
                                </>
                            )}
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