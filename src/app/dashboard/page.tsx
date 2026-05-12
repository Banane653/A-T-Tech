'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [employees, setEmployees] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [customerCount, setCustomerCount] = useState(0);
    const [companyId, setCompanyId] = useState(''); // 👈 Nouveau : on stocke l'ID
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        const res = await fetch('/api/admin/employees');
        if (res.ok) {
            const data = await res.json();
            setEmployees(data.employees);
            setCompanyName(data.company.name);
            setCustomerCount(data.company._count.customers);
            setCompanyId(data.company.id); // 👈 Nouveau : on récupère l'ID
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch('/api/admin/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setShowForm(false);
            setFormData({ name: '', email: '', password: '' });
            fetchData();
        } else {
            const data = await res.json();
            alert("Erreur : " + data.error);
        }
        setLoading(false);
    };

    // Création du lien d'inscription propre
    const registerLink = companyId && typeof window !== 'undefined' 
        ? `${window.location.origin}/register?companyId=${companyId}` 
        : '';

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 text-white p-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{companyName || "Mon Commerce"}</h1>
                        <p className="opacity-80 mt-1 text-blue-100">Tableau de bord de gestion</p>
                    </div>
                    <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition">
                        Déconnexion
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Stats Rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <p className="text-blue-600 font-semibold uppercase text-xs tracking-wider">Clients Fidélisés</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{customerCount}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Équipe</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{employees.length} employé(s)</p>
                        </div>
                    </div>

                    {/* 🔗 LA NOUVELLE ZONE DU LIEN D'INSCRIPTION */}
                    {companyId && (
                        <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm space-y-3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                🔗 Votre lien d'inscription client
                            </h3>
                            <p className="text-sm text-gray-500">
                                Copiez ce lien pour créer un QR Code à placer sur le comptoir de votre boutique :
                            </p>
                            <div className="flex items-center space-x-2">
                                <input 
                                    readOnly 
                                    value={registerLink} 
                                    className="flex-1 bg-gray-50 p-3 text-sm border border-gray-200 rounded-lg text-gray-700 outline-none"
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(registerLink);
                                        alert("Lien copié dans le presse-papier !");
                                    }} 
                                    className="bg-black text-white px-5 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                                >
                                    Copier
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Gestion d'équipe */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Mon Équipe</h2>
                            <button 
                                onClick={() => setShowForm(!showForm)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                            >
                                {showForm ? "Annuler" : "+ Ajouter un employé"}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Nom complet" required className="p-3 border rounded-lg text-black"
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    <input type="email" placeholder="Email de connexion" required className="p-3 border rounded-lg text-black"
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <input type="password" placeholder="Mot de passe provisoire" required className="w-full p-3 border rounded-lg text-black"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                                    {loading ? "Création..." : "Enregistrer l'employé"}
                                </button>
                            </form>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {employees.map((emp: any) => (
                                <div key={emp.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                            {emp.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{emp.name}</p>
                                            <p className="text-sm text-gray-500">{emp.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">Rôle : Serveur</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}