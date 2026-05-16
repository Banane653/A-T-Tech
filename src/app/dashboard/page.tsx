'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [employees, setEmployees] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [customerCount, setCustomerCount] = useState(0);
    const [companyId, setCompanyId] = useState('');
    
    // Nouveaux états pour le système de points
    const [systemType, setSystemType] = useState('STAMPS');
    const [pointsRatio, setPointsRatio] = useState(1);
    const [isSavingRatio, setIsSavingRatio] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        // Récupère l'équipe et les infos basiques
        const resEmployees = await fetch('/api/admin/employees');
        if (resEmployees.ok) {
            const data = await resEmployees.json();
            setEmployees(data.employees);
            setCompanyName(data.company.name);
            setCustomerCount(data.company._count.customers);
            setCompanyId(data.company.id);
        }

        // Récupère les paramètres du commerce (notamment le ratio)
        const resCompany = await fetch('/api/admin/company');
        if (resCompany.ok) {
            const data = await resCompany.json();
            setPointsRatio(data.company.pointsRatio);
            setSystemType(data.company.systemType);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            alert('Erreur : ' + data.error);
        }
        setLoading(false);
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ? Il n'aura plus accès au scanner.")) return;

        const res = await fetch(`/api/admin/employees?id=${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setEmployees(prev => prev.filter((emp: { id: string }) => emp.id !== id));
        } else {
            const data = await res.json();
            alert('Erreur : ' + data.error);
        }
    };

    // Nouvelle fonction pour sauvegarder le ratio
    const handleSaveRatio = async () => {
        setIsSavingRatio(true);
        const res = await fetch('/api/admin/company', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pointsRatio }),
        });

        if (res.ok) {
            alert('Taux de conversion mis à jour !');
        } else {
            alert('Erreur lors de la mise à jour.');
        }
        setIsSavingRatio(false);
    };

    const registerLink =
        companyId && typeof window !== 'undefined'
            ? `${window.location.origin}/register?companyId=${companyId}`
            : '';

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{companyName || 'Mon Commerce'}</h1>
            <p className="text-gray-500 mb-8">Gestion de votre équipe et paramètres</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-blue-600 font-semibold uppercase text-xs tracking-wider">
                        Clients Fidélisés
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{customerCount}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">Équipe</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{employees.length} employé(s)</p>
                </div>
            </div>

            {/* 👉 NOUVEAU BLOC : Configuration du Taux de Conversion (Affiché uniquement si en mode POINTS) */}
            {systemType === 'POINTS' && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm mb-8">
                    <h3 className="font-bold text-amber-900 mb-2">⚙️ Règle de fidélité</h3>
                    <p className="text-sm text-amber-800 mb-4">
                        Combien de points un client gagne-t-il pour 1 € dépensé ?
                    </p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-amber-200">
                            <span className="font-bold text-gray-700">1 € =</span>
                            <input
                                type="number"
                                min="1"
                                className="w-20 text-center font-bold text-xl outline-none text-black bg-transparent"
                                value={pointsRatio}
                                onChange={(e) => setPointsRatio(Number(e.target.value))}
                            />
                            <span className="font-bold text-gray-700">points</span>
                        </div>
                        <button
                            onClick={handleSaveRatio}
                            disabled={isSavingRatio}
                            className="bg-amber-500 text-white px-5 py-3 rounded-lg font-bold hover:bg-amber-600 transition"
                        >
                            {isSavingRatio ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </div>
                </div>
            )}

            {companyId && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-3 mb-8">
                    <h3 className="font-bold text-gray-800">🔗 Votre lien d&apos;inscription client</h3>
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
                                alert('Lien copié dans le presse-papier !');
                            }}
                            className="bg-black text-white px-5 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
                        >
                            Copier
                        </button>
                    </div>
                </div>
            )}

            {/* Le reste de ton code (Mon Équipe) est inchangé ci-dessous */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Mon Équipe</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        {showForm ? 'Annuler' : '+ Ajouter un employé'}
                    </button>
                </div>

                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nom complet"
                                required
                                className="p-3 border rounded-lg text-black"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email de connexion"
                                required
                                className="p-3 border rounded-lg text-black"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <input
                            type="password"
                            placeholder="Mot de passe provisoire"
                            required
                            className="w-full p-3 border rounded-lg text-black"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                        >
                            {loading ? 'Création...' : "Enregistrer l'employé"}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1 gap-3">
                    {employees.map((emp: { id: string; name: string; email: string }) => (
                        <div
                            key={emp.id}
                            className="p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition bg-white"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                    {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{emp.name}</p>
                                    <p className="text-sm text-gray-500">{emp.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <span className="text-xs font-bold text-gray-400 hidden sm:inline-block">Rôle : Serveur</span>
                                
                                <button 
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                                    title="Supprimer l'employé"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}