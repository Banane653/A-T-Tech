'use client';

import { useState, useEffect } from 'react';
import RegisterQrCode from '@/components/registerQrCode'; 
import { useTranslations, useLocale } from 'next-intl';

export default function AdminDashboard() {
    const t = useTranslations('MerchantTeam');
    const locale = useLocale();

    const [employees, setEmployees] = useState([]);
    const [companyName, setCompanyName] = useState('');
    const [customerCount, setCustomerCount] = useState(0);
    const [companyId, setCompanyId] = useState('');
    
    const [systemType, setSystemType] = useState('STAMPS');
    const [pointsRatio, setPointsRatio] = useState(1);
    const [isSavingRatio, setIsSavingRatio] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        const resEmployees = await fetch('/api/admin/employees');
        if (resEmployees.ok) {
            const data = await resEmployees.json();
            setEmployees(data.employees);
            setCompanyName(data.company.name);
            setCustomerCount(data.company._count.customers);
            setCompanyId(data.company.id);
        }

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
            setFormData({ name: '', email: '', username: '', password: '' });
            fetchData();
        } else {
            const data = await res.json();
            alert(`${t('alerts.error')} ${data.error}`);
        }
        setLoading(false);
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm(t('alerts.confirmDelete'))) return;

        const res = await fetch(`/api/admin/employees?id=${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setEmployees(prev => prev.filter((emp: { id: string }) => emp.id !== id));
        } else {
            const data = await res.json();
            alert(`${t('alerts.error')} ${data.error}`);
        }
    };

    const handleSaveRatio = async () => {
        setIsSavingRatio(true);
        const res = await fetch('/api/admin/company', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pointsRatio }),
        });

        if (res.ok) {
            alert(t('alerts.ratioSuccess'));
        } else {
            alert(t('alerts.ratioError'));
        }
        setIsSavingRatio(false);
    };

    // On génère le lien en y incluant la locale courante pour que le client tombe
    // sur la bonne langue par défaut (bien qu'il puisse la changer ensuite).
    const registerLink =
        companyId && typeof window !== 'undefined'
            ? `${window.location.origin}/${locale}/register?companyId=${companyId}`
            : '';

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {companyName || t('header.defaultName')}
            </h1>
            <p className="text-gray-500 mb-8">{t('header.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-blue-600 font-semibold uppercase text-xs tracking-wider">
                        {t('stats.customers')}
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{customerCount}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
                        {t('stats.team')}
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                        {t('stats.employeeCount', { count: employees.length })}
                    </p>
                </div>
            </div>

            {systemType === 'POINTS' && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm mb-8">
                    <h3 className="font-bold text-amber-900 mb-2">{t('points.title')}</h3>
                    <p className="text-sm text-amber-800 mb-4">
                        {t('points.desc')}
                    </p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-amber-200">
                            <input
                                type="number"
                                min="1"
                                className="w-20 text-center font-bold text-xl outline-none text-black bg-transparent border-b-2 border-amber-300 focus:border-amber-500"
                                value={pointsRatio}
                                onChange={(e) => setPointsRatio(Number(e.target.value))}
                            />
                            <span className="font-bold text-gray-700">{t('points.currency')}</span>
                        </div>
                        <button
                            onClick={handleSaveRatio}
                            disabled={isSavingRatio}
                            className="bg-amber-500 text-white px-5 py-3 rounded-lg font-bold hover:bg-amber-600 transition"
                        >
                            {isSavingRatio ? t('points.savingBtn') : t('points.saveBtn')}
                        </button>
                    </div>
                </div>
            )}

            {companyId && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-8">
                    {/* On passe en flex-col sur mobile, et flex-row sur desktop */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex-1 space-y-3 w-full">
                            <h3 className="font-bold text-gray-800">{t('link.title')}</h3>
                            <p className="text-sm text-gray-500 max-w-lg">
                                {t('link.desc')}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 w-full">
                                <input
                                    readOnly
                                    value={registerLink}
                                    className="flex-1 bg-gray-50 p-3 text-sm border border-gray-200 rounded-lg text-gray-700 outline-none focus:border-gray-300 w-full"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(registerLink);
                                        alert(t('alerts.copied'));
                                    }}
                                    className="bg-black text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition whitespace-nowrap"
                                >
                                    {t('link.copyBtn')}
                                </button>
                            </div>

                            {/* 👇 BOUTON MOBILE SEULEMENT 👇 */}
                            <button
                                onClick={() => setShowQrModal(true)}
                                className="md:hidden w-full mt-4 bg-blue-50 text-blue-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2 border border-blue-100 active:scale-95 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                Afficher le QR Code
                            </button>
                        </div>

                        {/* 👇 QR CODE DESKTOP SEULEMENT 👇 */}
                        <div className="hidden md:block flex-shrink-0 pt-1">
                            <RegisterQrCode 
                                registerUrl={registerLink} 
                                merchantName={companyName} 
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">{t('team.title')}</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        {showForm ? t('team.cancelBtn') : t('team.addBtn')}
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
                                placeholder={t('form.fullName')}
                                required
                                className="p-3 border rounded-lg text-black"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder={t('form.email')}
                                required
                                className="p-3 border rounded-lg text-black"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder={t('form.username')}
                            required
                            pattern="^[a-zA-Z0-9_.]+$"
                            title={t('form.usernameTitle')}
                            className="p-3 border rounded-lg text-black bg-white"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })} 
                        />
                        <input
                            type="password"
                            placeholder={t('form.password')}
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
                            {loading ? t('form.loadingBtn') : t('form.submitBtn')}
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
                                <span className="text-xs font-bold text-gray-400 hidden sm:inline-block">
                                    {t('team.roleLabel')}
                                </span>
                                
                                <button 
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                                    title={t('team.deleteTitle')}
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
            {showQrModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setShowQrModal(false)} // Ferme si on clique à côté
                >
                    <div 
                        className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center relative shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur la carte
                    >
                        {/* Croix de fermeture */}
                        <button 
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-lg font-bold mb-6 text-center text-gray-800">
                            Faire scanner le client
                        </h3>
                        
                        <div className="transform scale-160 mb-4">
                            <RegisterQrCode 
                                registerUrl={registerLink} 
                                merchantName={companyName} 
                            />
                        </div>

                        <button 
                            onClick={() => setShowQrModal(false)}
                            className="mt-6 w-full bg-black text-white font-bold py-3 rounded-xl active:scale-95 transition"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}