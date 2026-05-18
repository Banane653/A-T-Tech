'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';

type CompanyInfo = { name: string; systemType: string };
type CustomerInfo = { id: string; firstName: string; lastName: string | null; points: number };
type Reward = { id: string; name: string; cost: number };

type ScanStatus =
    | 'scanning'
    | 'customer'
    | 'loading'
    | 'result';

type CameraUiState = 'permission' | 'requesting' | 'active';

const STAMP_LIMIT = 10;
const PERMISSION_BUTTON_ID = 'html5-qrcode-button-camera-permission';
const START_BUTTON_ID = 'html5-qrcode-button-camera-start';

function ScannerPermissionPrompt({
    requesting,
    onAuthorize,
}: {
    requesting: boolean;
    onAuthorize: () => void;
}) {
    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white px-6 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Camera className="h-10 w-10 text-gray-800" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-black">Accès à la caméra requis</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
                Pour scanner la carte de fidélité de vos clients, veuillez autoriser l&apos;accès à
                l&apos;appareil photo.
            </p>
            <button
                type="button"
                onClick={onAuthorize}
                disabled={requesting}
                className="mt-8 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 text-base font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {requesting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Autorisation en cours…
                    </>
                ) : (
                    'Autoriser la caméra'
                )}
            </button>
        </div>
    );
}

function ScannerViewfinderOverlay() {
    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
            <div
                className="relative h-56 w-56 max-w-[70vw] rounded-sm sm:h-64 sm:w-64"
                style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)' }}
            >
                <span className="absolute left-0 top-0 h-10 w-10 rounded-tl border-l-[3px] border-t-[3px] border-white" />
                <span className="absolute right-0 top-0 h-10 w-10 rounded-tr border-r-[3px] border-t-[3px] border-white" />
                <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl border-b-[3px] border-l-[3px] border-white" />
                <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br border-b-[3px] border-r-[3px] border-white" />
            </div>
            <p className="absolute bottom-5 left-0 right-0 px-4 text-center text-sm font-medium text-white drop-shadow-md">
                Placez le QR code du client dans le cadre
            </p>
        </div>
    );
}

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

    const [cameraUi, setCameraUi] = useState<CameraUiState>('permission');

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
    

    const syncCameraUi = useCallback(() => {
        const permissionBtn = document.getElementById(
            PERMISSION_BUTTON_ID
        ) as HTMLButtonElement | null;
        const startBtn = document.getElementById(START_BUTTON_ID) as HTMLButtonElement | null;
        const video = document.querySelector('#reader video') as HTMLVideoElement | null;

        const videoActive =
            !!video &&
            video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            video.videoWidth > 0 &&
            !video.paused;

        if (videoActive) {
            setCameraUi('active');
            return;
        }

        if (permissionBtn && permissionBtn.offsetParent !== null) {
            setCameraUi(permissionBtn.disabled ? 'requesting' : 'permission');
            return;
        }

        if (
            startBtn &&
            startBtn.offsetParent !== null &&
            startBtn.style.display !== 'none' &&
            !startBtn.disabled
        ) {
            startBtn.click();
        }

        setCameraUi('requesting');
    }, []);

    const requestCameraPermission = useCallback(() => {
        document.getElementById(PERMISSION_BUTTON_ID)?.click();
        setCameraUi('requesting');
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

        const scanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const edge = Math.min(viewfinderWidth, viewfinderHeight);
                    const size = Math.floor(edge * 0.65);
                    return { width: size, height: size };
                },
                aspectRatio: 1,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                videoConstraints: { facingMode: "environment" },
                rememberLastUsedCamera: false,
            },
            false
        );
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

    useEffect(() => {
        if (status !== 'scanning') return;

        const reader = document.getElementById('reader');
        if (!reader) return;

        syncCameraUi();

        const observer = new MutationObserver(syncCameraUi);
        observer.observe(reader, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'disabled'],
        });

        const interval = window.setInterval(syncCameraUi, 400);

        return () => {
            observer.disconnect();
            window.clearInterval(interval);
        };
    }, [status, syncCameraUi]);

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
        setCameraUi('permission');
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
    const showPermissionOverlay =
        status === 'scanning' && cameraUi !== 'active';
    const showViewfinder = status === 'scanning' && cameraUi === 'active';

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
                    <Link
                        href="/dashboard"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-100"
                        aria-label="Retour au tableau de bord"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-bold text-black">Scanner un client</h1>
                        {companyInfo?.name && (
                            <p className="truncate text-xs text-gray-500">{companyInfo.name}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
                    >
                        Quitter
                    </button>
                </div>
            </header>

            <div className="mx-auto w-full max-w-md p-4">
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                    {companyInfo && (
                        <div className="border-b border-gray-100 bg-gray-50 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-gray-500">
                            Mode {isStamps ? 'TAMPONS' : 'POINTS'}
                        </div>
                    )}

                    <div className="relative min-h-[400px] p-4">
                        <div
                            className={`relative overflow-hidden rounded-2xl bg-black ${
                                status !== 'scanning' ? 'hidden' : 'block'
                            }`}
                            style={{ minHeight: 'min(70vh, 420px)' }}
                        >
                            <div
                                id="reader"
                                className="scanner-reader absolute inset-0 h-full w-full"
                            />

                            {showPermissionOverlay && (
                                <ScannerPermissionPrompt
                                    requesting={cameraUi === 'requesting'}
                                    onAuthorize={requestCameraPermission}
                                />
                            )}

                            {showViewfinder && <ScannerViewfinderOverlay />}
                        </div>

                        {status === 'customer' && customer && (
                            <div className="w-full space-y-5 animate-in fade-in">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Client</p>
                                    <p className="text-xl font-black text-black">{customerName}</p>
                                </div>

                                {isStamps ? (
                                    <>
                                        <div className="rounded-2xl bg-gray-50 py-4 text-center">
                                            <p className="text-sm font-bold uppercase text-gray-500">
                                                Solde tampons
                                            </p>
                                            <p className="mt-1 text-5xl font-black text-black">
                                                {customer.points}/{stampLimit}
                                            </p>
                                            {customer.points >= stampLimit && (
                                                <p className="mt-2 text-sm font-bold text-amber-600">
                                                    Carte pleine — scannez pour offrir le cadeau
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleAction({
                                                    action: 'add_stamp',
                                                    description: '+1 tampon',
                                                })
                                            }
                                            className="w-full rounded-2xl bg-black py-5 text-xl font-black text-white transition hover:bg-gray-800"
                                        >
                                            Ajouter 1 Tampon
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="rounded-2xl bg-blue-50 py-3 text-center">
                                            <p className="text-sm font-bold uppercase text-gray-500">
                                                Solde points
                                            </p>
                                            <p className="text-4xl font-black text-blue-900">
                                                {customer.points} pts
                                            </p>
                                        </div>

                                        <div className="flex overflow-hidden rounded-xl border border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setPointsTab('earn')}
                                                className={`flex-1 py-3 text-sm font-bold ${
                                                    pointsTab === 'earn'
                                                        ? 'bg-black text-white'
                                                        : 'bg-white text-gray-600'
                                                }`}
                                            >
                                                Encaisser
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPointsTab('spend')}
                                                className={`flex-1 py-3 text-sm font-bold ${
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
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        autoFocus
                                                        step="0.01"
                                                        placeholder="Montant du ticket"
                                                        className="w-full border-b-4 border-black py-4 pr-8 text-center text-3xl font-black text-black outline-none"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                                                        €
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAction({
                                                            action: 'add_points',
                                                            amount: Number(amount),
                                                            description: `Achat de ${Number(amount).toFixed(2)}€`,
                                                        })
                                                    }
                                                    className="w-full rounded-2xl bg-black py-4 text-lg font-black text-white hover:bg-gray-800"
                                                >
                                                    VALIDER L&apos;ACHAT
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                                {rewards.length === 0 ? (
                                                    <p className="py-4 text-center text-sm text-gray-400">
                                                        Aucune récompense configurée
                                                    </p>
                                                ) : (
                                                    rewards.map((reward) => {
                                                        const canAfford =
                                                            customer.points >= reward.cost;
                                                        return (
                                                            <button
                                                                key={reward.id}
                                                                type="button"
                                                                disabled={!canAfford}
                                                                onClick={() =>
                                                                    handleAction({
                                                                        action: 'spend_points',
                                                                        rewardId: reward.id,
                                                                    })
                                                                }
                                                                className={`w-full rounded-xl p-4 text-left font-bold transition ${
                                                                    canAfford
                                                                        ? 'bg-amber-400 text-amber-900 hover:bg-amber-500'
                                                                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                                }`}
                                                            >
                                                                <span className="block">
                                                                    {reward.name}
                                                                </span>
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
                                    type="button"
                                    onClick={resetScanner}
                                    className="w-full py-2 text-sm font-bold text-gray-400"
                                >
                                    Annuler / Scanner suivant
                                </button>
                            </div>
                        )}

                        {(status === 'loading' || status === 'result') && (
                            <div
                                className={`absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl p-6 text-center ${
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
                                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                                ) : (
                                    <div>
                                        {message?.type === 'reward' && (
                                            <p className="mb-4 text-6xl">🎉</p>
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
                                        <p className="mt-4 text-sm text-white opacity-70">
                                            Prêt pour le client suivant...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
