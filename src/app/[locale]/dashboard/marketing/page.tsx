'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs de rendu serveur (SSR) avec Leaflet
const MapPreview = dynamic(() => import('@/components/MapPreview'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-64 mt-3 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center border border-gray-200">
            <span className="text-sm font-semibold text-gray-400">Chargement de la carte...</span>
        </div>
    )
});

type TabType = 'flash' | 'proximity';
type Location = { 
    name: string; 
    address: string; 
    latitude: number; 
    longitude: number; 
    proximityText: string; 
};

export default function MarketingPage() {
    const t = useTranslations('MerchantMarketing');
    
    // États communs
    const [activeTab, setActiveTab] = useState<TabType>('flash');
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string>('Votre Commerce');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // États Onglet 1 : Campagne Flash
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notifiedCount, setNotifiedCount] = useState(0);

    // États Onglet 2 : Proximity GPS (Multi-adresses)
    const [locations, setLocations] = useState<Location[]>([]);
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newProximityText, setNewProximityText] = useState('');
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);

    // Récupération des données d'entreprise
    useEffect(() => {
        fetch('/api/admin/company')
            .then((res) => res.json())
            .then((data) => {
                if (data.company) {
                    setCompanyId(data.company.id);
                    setCompanyName(data.company.name);
                    setCompanyLogo(data.company.logoUrl);
                    if (data.company.locations) {
                        setLocations(data.company.locations);
                    }
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

    // Recherche et ajout d'une localisation à la liste
    const handleAddLocation = async () => {
        if (!newAddress.trim() || !newName.trim() || !newProximityText.trim()) return;
        if (locations.length >= 10) return;

        setIsSearchingAddress(true);
        setGeoError(null);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newAddress)}&limit=1`
            );
            const data = await res.json();

            if (data && data.length > 0) {
                const newLoc: Location = {
                    name: newName,
                    address: newAddress,
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                    proximityText: newProximityText
                };
                setLocations([...locations, newLoc]);
                setNewName('');
                setNewAddress('');
                setNewProximityText('');
                setStatus('idle');
            } else {
                setGeoError(t('gps.notFound'));
            }
        } catch (err) {
            setGeoError(t('gps.searchError'));
        } finally {
            setIsSearchingAddress(false);
        }
    };

    const handleRemoveLocation = (index: number) => {
        setLocations(locations.filter((_, i) => i !== index));
    };

    // Enregistrement global de la liste des localisations GPS
    const handleSaveProximity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId) return;
        setStatus('loading');

        try {
            const res = await fetch('/api/admin/company', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    isGpsUpdate: true, 
                    locations 
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
                        /* FORMULAIRE 2 : GEOFENCING PROXIMITÉ MULTI-ADRESSES */
                        <form onSubmit={handleSaveProximity} className="space-y-6">
                            
                            {/* Carte dynamique affichant toutes les épingles */}
                            <MapPreview locations={locations.map(l => ({ lat: l.latitude, lng: l.longitude }))} />

                            {/* Liste des points de vente enregistrés */}
                            {locations.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        Vos points de vente ({locations.length}/10)
                                    </h3>
                                    {locations.map((loc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                                                <p className="text-xs text-gray-500">{loc.address}</p>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveLocation(index)} 
                                                className="text-red-500 hover:text-red-700 p-2 text-sm font-semibold transition"
                                            >
                                                Retirer
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulaire d'ajout d'une nouvelle adresse (max 10) */}
                            {locations.length < 10 ? (
                                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900">Ajouter un établissement</h3>
                                    
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Nom de la boutique (ex: Succursale Centre)"
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white transition"
                                    />
                                    <input
                                        type="text"
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)}
                                        placeholder="Adresse complète (ex: 15 Rue de la Loi, Bruxelles)"
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white transition"
                                    />
                                    <textarea
                                        value={newProximityText}
                                        onChange={(e) => setNewProximityText(e.target.value)}
                                        placeholder="Message GPS de proximité (ex: Bienvenue dans notre boutique du centre !)"
                                        rows={2}
                                        maxLength={100}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white transition resize-none"
                                    />
                                    
                                    {geoError && (
                                        <p className="text-xs text-red-500 font-medium">⚠️ {geoError}</p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleAddLocation}
                                        disabled={isSearchingAddress || !newName || !newAddress || !newProximityText}
                                        className="w-full py-2.5 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 shadow-sm"
                                    >
                                        {isSearchingAddress ? '🔍 Recherche...' : '+ Ajouter à la liste'}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center text-orange-800 text-xs font-medium">
                                    ⚠️ Limite de 10 adresses atteinte (maximum autorisé par Apple Wallet).
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading' || locations.length === 0 || !companyId}
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
                                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">
                                        {companyName || t('previewFallbackName')}
                                    </p>
                                    <p className="text-sm text-gray-800 leading-snug">
                                        {message || t('form.messagePlaceholder')}
                                    </p>
                                </>
                            ) : (
                                <>
                                    {/* Comportement Geofencing : Aperçu du premier message ou message type */}
                                    <p className="text-sm text-gray-900 leading-snug font-medium">
                                        {locations.length > 0 ? locations[0].proximityText : t('gps.messagePlaceholder')}
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