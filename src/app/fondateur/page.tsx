'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CARD_TEMPLATES, TemplateType } from '@/config/templates'; // 👈 NOUVEAU : On importe le catalogue

type Company = {
    id: string;
    name: string;
    systemType: string;
    primaryColor: string;
    logoUrl: string | null;
    cardTemplate: string; // 👈 NOUVEAU
    users: { name: string; email: string }[];
    _count: { customers: number };
};

export default function FondateurDashboard() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // 👈 Ajout de cardTemplate par défaut (on prend le premier modèle TAMPONS)
    const defaultTemplate = CARD_TEMPLATES.find(t => t.type === 'STAMPS')?.id || 'default';

    const [formData, setFormData] = useState({ 
        companyName: '', 
        adminName: '', 
        adminEmail: '', 
        adminPassword: '', 
        systemType: 'STAMPS' as TemplateType,
        primaryColor: '#000000', 
        logoUrl: '',
        cardTemplate: defaultTemplate // 👈 NOUVEAU
    });

    const fetchCompanies = async () => {
        const res = await fetch('/api/admin/companies');
        if (res.ok) {
            const data = await res.json();
            setCompanies(data);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleLogout = async () => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/admin/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setShowForm(false);
            setFormData({ 
                companyName: '', adminName: '', adminEmail: '', adminPassword: '', 
                systemType: 'STAMPS', primaryColor: '#000000', logoUrl: '', 
                cardTemplate: CARD_TEMPLATES.find(t => t.type === 'STAMPS')?.id || 'default' 
            });
            fetchCompanies();
        } else {
            const data = await res.json();
            alert("Erreur : " + data.error);
        }
        setLoading(false);
    };

    // 👈 NOUVEAU : On filtre les modèles selon le système choisi
    const availableTemplates = CARD_TEMPLATES.filter(t => t.type === formData.systemType);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-black text-white p-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Espace Fondateur</h1>
                        <p className="text-gray-400 mt-2">Bienvenue dans le centre de contrôle SaaS</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                        Déconnexion
                    </button>
                </div>

                <div className="p-8 space-y-6 text-black">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Commerces inscrits ({companies.length})</h2>
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition"
                        >
                            {showForm ? "Annuler" : "+ Nouveau Commerce"}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-xl space-y-6">
                            <h3 className="font-bold text-lg border-b pb-2">1. Informations du Commerce</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Nom du Commerce" required
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                                
                                <select 
                                    className="w-full p-3 border rounded-lg bg-white outline-none focus:border-black"
                                    value={formData.systemType} 
                                    onChange={e => {
                                        const newType = e.target.value as TemplateType;
                                        // Si on change de système, on auto-sélectionne le 1er modèle disponible
                                        const firstTemplateId = CARD_TEMPLATES.find(t => t.type === newType)?.id || 'default';
                                        setFormData({...formData, systemType: newType, cardTemplate: firstTemplateId});
                                    }}
                                >
                                    <option value="STAMPS">☕ Système à Tampons (10 tampons = Cadeau)</option>
                                    <option value="POINTS">🛍️ Système à Points (Lié au montant payé)</option>
                                </select>
                            </div>

                            {/* 🎨 ZONE DESIGN MISE À JOUR */}
                            <h3 className="font-bold text-lg border-b pb-2 pt-4">2. Design de la Carte Premium</h3>
                            
                            {/* Choix des couleurs et logo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1 font-semibold">Couleur principale de la carte</label>
                                    <div className="flex items-center gap-3 bg-white p-2 border rounded-lg">
                                        <input type="color" 
                                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                            value={formData.primaryColor} onChange={e => setFormData({...formData, primaryColor: e.target.value})} />
                                        <span className="text-gray-500 font-mono uppercase">{formData.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1 font-semibold">Lien du Logo (URL Image)</label>
                                    <input type="url" placeholder="https://site.com/logo.png" 
                                        className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                        value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} />
                                </div>
                            </div>

                            {/* 🌟 NOUVEAU : LA GALERIE DE MODÈLES */}
                            <div className="mt-4">
                                <label className="text-sm text-gray-600 mb-2 font-semibold block">Modèle du programme de fidélité</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {availableTemplates.map(tpl => (
                                        <div 
                                            key={tpl.id}
                                            onClick={() => setFormData({...formData, cardTemplate: tpl.id})}
                                            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                                                formData.cardTemplate === tpl.id 
                                                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                                                    : 'border-gray-200 bg-white hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="font-bold text-sm mb-1">{tpl.name}</div>
                                            <div className="text-xs text-gray-500">{tpl.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <h3 className="font-bold text-lg border-b pb-2 pt-4">3. Compte Gérant</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Nom du Gérant" required
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
                                <input type="email" placeholder="Email de connexion" required
                                    className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                    value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                            </div>
                            <input type="password" placeholder="Mot de passe provisoire" required
                                className="w-full p-3 border rounded-lg outline-none focus:border-black"
                                value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                            
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 mt-4">
                                {loading ? "Création du commerce..." : "Créer le commerce"}
                            </button>
                        </form>
                    )}

                    {companies.length === 0 && !showForm ? (
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
                            Aucun commerce n'est encore inscrit.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {companies.map(company => (
                                <div key={company.id} className="border p-4 rounded-xl flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center border shadow-inner"
                                            style={{ backgroundColor: company.primaryColor || '#000000' }}
                                        >
                                            {company.logoUrl ? (
                                                <img src={company.logoUrl} alt="logo" className="w-8 h-8 object-contain bg-white rounded-full p-1" />
                                            ) : (
                                                <span className="text-white font-bold text-xs">IMG</span>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg">{company.name}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${company.systemType === 'STAMPS' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {company.systemType === 'STAMPS' ? 'TAMPONS' : 'POINTS'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Modèle: <span className="font-semibold text-gray-700">{CARD_TEMPLATES.find(t => t.id === company.cardTemplate)?.name || 'Standard'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                                            {company._count.customers} clients
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}