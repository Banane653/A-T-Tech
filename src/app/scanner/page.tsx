'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

type CompanyInfo = { name: string; systemType: string };
type CustomerInfo = { id: string; firstName: string; lastName: string | null; points: number };
type Reward = { id: string; name: string; cost: number };

type ScanStatus =
    | 'scanning'
    | 'customer'
    | 'loading'
    | 'result';

const STAMP_LIMIT = 10;

export default function ScannerPage() {
    const [status, setStatus] = useState<ScanStatus>('scanning');
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const companyInfoRef = useRef<CompanyInfo | null>(null);

    const [scannedId, setScannedId] = useState<string | null>(null);
    const [customer, setCustomer] = useState<CustomerInfo | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [stampLimit, setStampLimit] = useState(STAMP_LIMIT);

    const [amount, setAmount] = useState('');
    const [pointsTab, setPointsTab] = useState<'earn' | 'spend'>('earn');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'reward' | 'error' } | null>(null);

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const router = useRouter();

    const lookupCustomer = useCallback(async (walletId: string) => {
        setStatus('loading');
        try {
            const res = await fetch('/api/wallet/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletId, action: 'lookup' }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ text: data.error, type: 'error' });
                setStatus('result');
                setTimeout(resetScanner, 3000);
                return;
            }
            setCustomer(data.customer);
            setRewards(data.rewards || []);
            setStampLimit(data.stampLimit || STAMP_LIMIT);
            setStatus('customer');
        } catch {
            setMessage({ text: 'Erreur serveur', type: 'error' });
            setStatus('result');
            setTimeout(resetScanner, 3000);
        }
    }, []);

    useEffect(() => {
        fetch('/api/scanner/config')
            .then((res) => res.json())
            .then((data) => {
                if (data.company) {
                    setCompanyInfo(data.company);
                    companyInfoRef.current = data.company;
                }
            });

        const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
        scannerRef.current = scanner;

        scanner.render(
            async (decodedText) => {
                scanner.pause(true);
                setScannedId(decodedText);
                await lookupCustomer(decodedText);
            },
            () => {}
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [lookupCustomer]);

    const handleAction = async (payload: Record<string, unknown>) => {
        if (!scannedId) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/wallet/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletId: scannedId, ...payload }),
            });
            const data = await res.json();
            if (res.ok) {
                setCustomer((prev) =>
                    prev ? { ...prev, points: data.newBalance } : prev
                );
                const isReward = data.wasReset || data.message?.includes('🎉');
                setMessage({
                    text: data.message,
                    type: isReward ? 'reward' : 'success',
                });
                if (data.wasReset) {
                    setStatus('result');
                    setTimeout(resetScanner, 5000);
                    return;
                }
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch {
            setMessage({ text: 'Erreur serveur', type: 'error' });
        }
        setStatus('result');
        setTimeout(resetScanner, 4000);
    };

    const resetScanner = () => {
        setMessage(null);
        setAmount('');
        setScannedId(null);
        setCustomer(null);
        setRewards([]);
        setPointsTab('earn');
        setStatus('scanning');
        scannerRef.current?.resume();
    };

    const handleLogout = () => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/login');
    };

    const customerName = customer
        ? `${customer.firstName}${customer.lastName ? ` ${customer.lastName}` : ''}`
        : '';

    const isStamps = companyInfo?.systemType === 'STAMPS';

    return (
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-black text-white p-6 flex justify-between items-center">
                    <h1 className="font-bold text-lg">{companyInfo?.name || 'Scanner'}</h1>
                    <button
                        onClick={handleLogout}
                        className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg font-bold"
                    >
                        Quitter
                    </button>
                </div>

                {companyInfo && (
                    <div className="bg-gray-100 text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b">
                        Mode {isStamps ? 'TAMPONS' : 'POINTS'}
                    </div>
                )}

                <div className="p-4 relative min-h-[400px] flex flex-col">
                    <div
                        id="reader"
                        className={`w-full rounded-2xl overflow-hidden ${
                            status !== 'scanning' ? 'hidden' : 'block'
                        }`}
                    />

                    {status === 'customer' && customer && (
                        <div className="w-full space-y-5 animate-in fade-in">
                            <div className="text-center">
                                <p className="text-gray-500 text-sm">Client</p>
                                <p className="text-xl font-black text-black">{customerName}</p>
                            </div>

                            {isStamps ? (
                                <>
                                    <div className="text-center py-4 bg-gray-50 rounded-2xl">
                                        <p className="text-gray-500 text-sm font-bold uppercase">
                                            Solde tampons
                                        </p>
                                        <p className="text-5xl font-black text-black mt-1">
                                            {customer.points}/{stampLimit}
                                        </p>
                                        {customer.points >= stampLimit && (
                                            <p className="text-amber-600 font-bold text-sm mt-2">
                                                Carte pleine — scannez pour offrir le cadeau
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleAction({
                                                action: 'add_stamp',
                                                description: '+1 tampon',
                                            })
                                        }
                                        className="w-full bg-black text-white py-5 rounded-2xl font-black text-xl hover:bg-gray-800 transition"
                                    >
                                        Ajouter 1 Tampon
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center py-3 bg-blue-50 rounded-2xl">
                                        <p className="text-gray-500 text-sm font-bold uppercase">
                                            Solde points
                                        </p>
                                        <p className="text-4xl font-black text-blue-900">
                                            {customer.points} pts
                                        </p>
                                    </div>

                                    <div className="flex rounded-xl overflow-hidden border border-gray-200">
                                        <button
                                            onClick={() => setPointsTab('earn')}
                                            className={`flex-1 py-3 font-bold text-sm ${
                                                pointsTab === 'earn'
                                                    ? 'bg-black text-white'
                                                    : 'bg-white text-gray-600'
                                            }`}
                                        >
                                            Encaisser
                                        </button>
                                        <button
                                            onClick={() => setPointsTab('spend')}
                                            className={`flex-1 py-3 font-bold text-sm ${
                                                pointsTab === 'spend'
                                                    ? 'bg-black text-white'
                                                    : 'bg-white text-gray-600'
                                            }`}
                                        >
                                            Offrir
                                        </button>
                                    </div>

                                    {pointsTab === 'earn' ? (
                                        <div className="space-y-3">
                                            <input
                                                type="number"
                                                autoFocus
                                                placeholder="Points à ajouter"
                                                className="w-full text-3xl font-black text-center py-4 text-black outline-none border-b-4 border-black"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            <button
                                                onClick={() =>
                                                    handleAction({
                                                        action: 'add_points',
                                                        amount: Number(amount),
                                                        description: `Achat de ${amount}€`,
                                                    })
                                                }
                                                className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800"
                                            >
                                                VALIDER L&apos;AJOUT
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {rewards.length === 0 ? (
                                                <p className="text-center text-gray-400 text-sm py-4">
                                                    Aucune récompense configurée
                                                </p>
                                            ) : (
                                                rewards.map((reward) => {
                                                    const canAfford = customer.points >= reward.cost;
                                                    return (
                                                        <button
                                                            key={reward.id}
                                                            disabled={!canAfford}
                                                            onClick={() =>
                                                                handleAction({
                                                                    action: 'spend_points',
                                                                    rewardId: reward.id,
                                                                })
                                                            }
                                                            className={`w-full p-4 rounded-xl font-bold text-left transition ${
                                                                canAfford
                                                                    ? 'bg-amber-400 text-amber-900 hover:bg-amber-500'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <span className="block">{reward.name}</span>
                                                            <span className="text-sm opacity-80">
                                                                {reward.cost} points
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                onClick={resetScanner}
                                className="w-full text-gray-400 font-bold py-2 text-sm"
                            >
                                Annuler / Scanner suivant
                            </button>
                        </div>
                    )}

                    {(status === 'loading' || status === 'result') && (
                        <div
                            className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center rounded-3xl ${
                                status === 'result'
                                    ? message?.type === 'success'
                                        ? 'bg-green-500'
                                        : message?.type === 'reward'
                                          ? 'bg-yellow-400'
                                          : 'bg-red-500'
                                    : 'bg-black/90'
                            }`}
                        >
                            {status === 'loading' ? (
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div>
                                    {message?.type === 'reward' && (
                                        <p className="text-6xl mb-4">🎉</p>
                                    )}
                                    <p
                                        className={`text-2xl font-black ${
                                            message?.type === 'reward'
                                                ? 'text-yellow-900'
                                                : 'text-white'
                                        }`}
                                    >
                                        {message?.type === 'reward'
                                            ? 'BRAVO ! Donnez le cadeau au client !'
                                            : message?.text}
                                    </p>
                                    <p className="mt-4 opacity-70 text-sm text-white">
                                        Prêt pour le client suivant...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
