'use client'; // Obligatoire car on utilise du state (interactivité)

import { useState } from 'react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', birthDate: '' });
    const [saveUrl, setSaveUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.saveUrl) {
                setSaveUrl(data.saveUrl);
            }
        } catch (err) {
            alert("Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">A-T-Tech Fidelity</h1>
                <p className="text-center text-gray-500 mb-8">Inscrivez-vous pour obtenir votre carte</p>

                {!saveUrl ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="text" placeholder="Prénom" required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            />
                            <input 
                                type="text" placeholder="Nom"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            />
                        </div>
                        <input 
                            type="email" placeholder="Adresse Email" required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-400 ml-1 mb-1">Date de naissance</label>
                            <input 
                                type="date" required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                            />
                        </div>
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition duration-200"
                        >
                            {loading ? "Chargement..." : "S'inscrire"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-10 flex flex-col items-center">
                        <div className="bg-green-100 text-green-700 p-4 rounded-full inline-block">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold text-black">Inscription réussie !</h2>
                        <p className="text-gray-500">Cliquez ci-dessous pour enregistrer votre carte dans votre téléphone.</p>
                        
                        {/* Le bouton officiel Google Wallet */}
                        <a href={saveUrl} target="_blank" rel="noreferrer" className="inline-block transition transform hover:scale-105">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Wallet_badge.svg/512px-Google_Wallet_badge.svg.png" 
                                alt="Add to Google Wallet" 
                                className="h-16"
                            />
                        </a>
                    </div>
                )}
            </div>
        </main>
    );
}