'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function ScannerPage() {
    const [status, setStatus] = useState<'scanning' | 'amount_entry' | 'loading' | 'result'>('scanning');
    const [companyInfo, setCompanyInfo] = useState<{name: string, systemType: string} | null>(null);
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'reward' | 'error' } | null>(null);
    
    const scannerRef = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        // On récupère les infos du commerce au chargement
        fetch('/api/admin/employees').then(res => res.json()).then(data => {
            if (data.company) setCompanyInfo(data.company);
        });

        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
        scannerRef.current = scanner;

        scanner.render(async (decodedText) => {
            scanner.pause(true);
            setScannedId(decodedText);
            
            // Si c'est un système de points, on demande le montant
            if (companyInfo?.systemType === 'POINTS') {
                setStatus('amount_entry');
            } else {
                // Si c'est des tampons, on envoie direct
                handleAction(decodedText);
            }
        }, () => {});

        return () => { scanner.clear(); };
    }, [companyInfo?.systemType]);

    const handleAction = async (walletId: string, val?: string) => {
        setStatus('loading');
        try {
            const res = await fetch('/api/wallet/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletId, amount: val, systemType: companyInfo?.systemType })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message, type: data.message.includes('🎉') ? 'reward' : 'success' });
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: "Erreur serveur", type: 'error' });
        }
        setStatus('result');
        setTimeout(resetScanner, 4000);
    };

    const resetScanner = () => {
        setMessage(null);
        setAmount('');
        setScannedId(null);
        setStatus('scanning');
        scannerRef.current?.resume();
    };

    return (
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-black text-white p-6 flex justify-between items-center">
                    <h1 className="font-bold text-lg">{companyInfo?.name || 'Scanner'}</h1>
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded uppercase tracking-widest font-bold">
                        {companyInfo?.systemType}
                    </span>
                </div>

                <div className="p-4 relative min-h-[350px] flex flex-col items-center justify-center">
                    {/* ZONE CAMERA */}
                    <div id="reader" className={`w-full rounded-2xl overflow-hidden ${status !== 'scanning' ? 'hidden' : 'block'}`}></div>

                    {/* SAISIE DU MONTANT (Uniquement pour le mode POINTS) */}
                    {status === 'amount_entry' && (
                        <div className="w-full space-y-4 animate-in fade-in zoom-in-95">
                            <h2 className="text-center font-black text-2xl text-black">Montant de l'achat</h2>
                            <div className="relative">
                                <input 
                                    type="number" autoFocus placeholder="0.00"
                                    className="w-full text-5xl font-black text-center py-4 text-black outline-none border-b-4 border-black"
                                    value={amount} onChange={(e) => setAmount(e.target.value)}
                                />
                                <span className="absolute right-0 bottom-4 text-2xl font-bold text-black">€</span>
                            </div>
                            <button 
                                onClick={() => handleAction(scannedId!, amount)}
                                className="w-full bg-black text-white py-4 rounded-2xl font-black text-xl hover:bg-gray-800 transition"
                            >
                                VALIDER LE SCAN
                            </button>
                            <button onClick={resetScanner} className="w-full text-gray-400 font-bold">Annuler</button>
                        </div>
                    )}

                    {/* CHARGEMENT / RESULTAT */}
                    {(status === 'loading' || status === 'result') && (
                        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center ${
                            status === 'result' ? (message?.type === 'success' ? 'bg-green-500' : message?.type === 'reward' ? 'bg-yellow-400' : 'bg-red-500') : 'bg-black/90'
                        }`}>
                            {status === 'loading' ? (
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <div className="text-white">
                                    <p className={`text-2xl font-black ${message?.type === 'reward' ? 'text-yellow-900' : 'text-white'}`}>{message?.text}</p>
                                    <p className="mt-4 opacity-70 text-sm">Prêt pour le client suivant...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}