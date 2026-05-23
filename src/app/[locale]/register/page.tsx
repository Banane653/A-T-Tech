'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';

type PublicCompany = {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
    textColor: string | null;
};

function RegisterSkeleton() {
    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-7 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-8" />
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-gray-100 rounded-lg" />
                    <div className="h-12 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-12 bg-gray-100 rounded-lg" />
                <div className="h-12 bg-gray-100 rounded-lg" />
                <div className="h-12 bg-gray-200 rounded-lg mt-2" />
            </div>
        </div>
    );
}

function RegisterForm() {
    const searchParams = useSearchParams();
    const companyId = searchParams.get('companyId');

    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', birthDate: '' });
    const [saveUrl, setSaveUrl] = useState<string | null>(null);
    const [registeredIdentity, setRegisteredIdentity] = useState<{ name: string; email: string } | null>(null);
    const [appleLoading, setAppleLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [today, setToday] = useState('');
    const [company, setCompany] = useState<PublicCompany | null>(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [companyError, setCompanyError] = useState<string | null>(null);

    useEffect(() => {
        setToday(new Date().toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (!companyId) {
            setCompanyLoading(false);
            return;
        }

        let cancelled = false;

        const fetchCompany = async () => {
            setCompanyLoading(true);
            setCompanyError(null);
            try {
                const res = await fetch(`/api/public/company?companyId=${encodeURIComponent(companyId)}`);
                const data = await res.json();
                if (cancelled) return;

                if (!res.ok) {
                    setCompany(null);
                    setCompanyError(data.error || 'Commerce introuvable');
                    return;
                }

                setCompany(data.company);
            } catch {
                if (!cancelled) {
                    setCompany(null);
                    setCompanyError('Impossible de charger les informations du commerce.');
                }
            } finally {
                if (!cancelled) setCompanyLoading(false);
            }
        };

        fetchCompany();
        return () => {
            cancelled = true;
        };
    }, [companyId]);

    if (!companyId) {
        return (
            <div className="text-center p-10 text-red-600 font-bold">
                Lien invalide. Veuillez scanner le QR code du commerce.
            </div>
        );
    }

    if (companyLoading) {
        return <RegisterSkeleton />;
    }

    if (companyError || !company) {
        return (
            <div className="text-center p-10 text-red-600 font-bold max-w-md">
                {companyError || 'Commerce introuvable.'}
            </div>
        );
    }

    const buttonStyle = {
        backgroundColor: company.primaryColor || '#000000',
        color: company.textColor || '#ffffff',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, companyId }),
            });
            const data = await res.json();

            if (res.ok && data.saveUrl) {
                setSaveUrl(data.saveUrl);
                setRegisteredIdentity({
                    name: formData.firstName,
                    email: formData.email,
                });
            } else {
                alert('Erreur : ' + (data.error || 'Inscription refusée'));
            }
        } catch {
            alert('Erreur de connexion au serveur.');
        } finally {
            setLoading(false);
        }
    };

    const handleAppleWalletClick = async () => {
        if (!registeredIdentity || !companyId) return;

        setAppleLoading(true);
        try {
            const params = new URLSearchParams({
                name: registeredIdentity.name,
                email: registeredIdentity.email,
                companyId,
            });

            const response = await fetch(`/api/wallet/apple?${params.toString()}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Impossible de générer le pass Apple Wallet.');
            }

            const passBlob = await response.blob();
            const objectUrl = URL.createObjectURL(passBlob);

            // Mobile Safari handles Apple Wallet passes better when we trigger a real file download link.
            // This ensures iOS can open the .pkpass and show the native "Add to Wallet" modal.
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = 'loyalty.pkpass';
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 1000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur Apple Wallet inconnue.';
            alert(`Erreur : ${message}`);
        } finally {
            setAppleLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            {company.logoUrl && (
                <img
                    src={company.logoUrl}
                    alt={`Logo ${company.name}`}
                    className="h-16 w-auto mx-auto mb-4 object-contain"
                />
            )}
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">{company.name}</h1>
            <p className="text-center text-gray-500 mb-8">Inscrivez-vous pour obtenir votre carte</p>

            {!saveUrl ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Prénom"
                            required
                            value={formData.firstName}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            required
                            value={formData.lastName}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Adresse Email"
                        required
                        value={formData.email}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 ml-1 mb-1">Date de naissance</label>
                        <input
                            type="date"
                            required
                            max={today || undefined}
                            value={formData.birthDate}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                        className="w-full font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Création en cours...' : 'Obtenir ma carte'}
                    </button>
                </form>
            ) : (
                <div className="text-center space-y-6 py-10 flex flex-col items-center">
                    <div className="bg-green-100 text-green-700 p-4 rounded-full inline-block">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-black">Inscription réussie !</h2>
                    <p className="text-gray-500">
                        Cliquez ci-dessous pour enregistrer votre carte dans votre téléphone.
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href={saveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-12 items-center transition-transform hover:scale-105 active:scale-95"
                        >
                            <img
                                src="/assets/google-wallet-badge-fr.svg"
                                alt="Ajouter à Google Wallet"
                                className="h-12 w-auto"
                            />
                        </a>

                        <button
                            type="button"
                            onClick={handleAppleWalletClick}
                            disabled={appleLoading}
                            className="inline-flex h-12 items-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                        >
                            <img
                                src="/assets/apple-wallet-badge-fr.svg"
                                alt="Ajouter a Apple Wallet"
                                className="h-12 w-auto"
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Suspense fallback={<RegisterSkeleton />}>
                <RegisterForm />
            </Suspense>

            <Footer />
        </main>
    );
}
