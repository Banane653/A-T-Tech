'use client';

import { useState, useEffect } from 'react';
import { CARD_TEMPLATES, TemplateType } from '@/config/templates';
import { useTranslations } from 'next-intl';

type Company = {
    id: string;
    name: string;
    systemType: string;
    primaryColor: string;
    logoUrl: string | null;
    cardTemplate: string;
    users: { name: string; email: string }[];
    _count: { customers: number };
};

const defaultTemplate = CARD_TEMPLATES.find((t) => t.type === 'STAMPS')?.id || 'default';

const initialFormData = {
    companyName: '',
    adminName: '',
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    systemType: 'STAMPS' as TemplateType,
    primaryColor: '#000000',
    logoUrl: '',
    cardTemplate: defaultTemplate,
};

export default function FounderCompaniesPage() {
    const t = useTranslations('FounderCompanies');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState(initialFormData);

    const fetchCompanies = async () => {
        const res = await fetch('/api/admin/companies');
        if (res.ok) {
            const data = await res.json();
            setCompanies(data);
        }
    };

    useEffect(() => {
        fetchCompanies().finally(() => setFetching(false));
    }, []);

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
                ...initialFormData,
                cardTemplate: CARD_TEMPLATES.find((t) => t.type === 'STAMPS')?.id || 'default',
            });
            fetchCompanies();
        } else {
            const data = await res.json();
            alert(`${t('alerts.error')} ${data.error}`);
        }
        setLoading(false);
    };

    const availableTemplates = CARD_TEMPLATES.filter((t) => t.type === formData.systemType);

    const inputClass =
        'w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

    return (
        <div className="p-8 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">{t('header.title')}</h1>
                    <p className="text-slate-400">
                        {t('header.subtitle', { count: companies.length })}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="shrink-0 bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-900/40"
                >
                    {showForm ? t('header.btnCancel') : t('header.btnNew')}
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-slate-900 border border-indigo-900/40 p-6 rounded-2xl space-y-6 mb-8"
                >
                    <h3 className="font-bold text-lg text-white border-b border-slate-700 pb-2">
                        {t('form.section1.title')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder={t('form.section1.companyName')}
                            required
                            className={inputClass}
                            value={formData.companyName}
                            onChange={(e) =>
                                setFormData({ ...formData, companyName: e.target.value })
                            }
                        />

                        <select
                            className={inputClass}
                            value={formData.systemType}
                            onChange={(e) => {
                                const newType = e.target.value as TemplateType;
                                const firstTemplateId =
                                    CARD_TEMPLATES.find((t) => t.type === newType)?.id || 'default';
                                setFormData({
                                    ...formData,
                                    systemType: newType,
                                    cardTemplate: firstTemplateId,
                                });
                            }}
                        >
                            <option value="STAMPS">
                                {t('form.section1.systemStamps')}
                            </option>
                            <option value="POINTS">
                                {t('form.section1.systemPoints')}
                            </option>
                        </select>
                    </div>

                    <h3 className="font-bold text-lg text-white border-b border-slate-700 pb-2 pt-4">
                        {t('form.section2.title')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="flex flex-col">
                            <label className="text-sm text-slate-400 mb-1 font-semibold">
                                {t('form.section2.primaryColor')}
                            </label>
                            <div className="flex items-center gap-3 bg-slate-800 p-2 border border-slate-600 rounded-lg">
                                <input
                                    type="color"
                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                    value={formData.primaryColor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, primaryColor: e.target.value })
                                    }
                                />
                                <span className="text-slate-300 font-mono uppercase">
                                    {formData.primaryColor}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm text-slate-400 mb-1 font-semibold">
                                {t('form.section2.logoUrl')}
                            </label>
                            <input
                                type="url"
                                placeholder="https://site.com/logo.png"
                                className={inputClass}
                                value={formData.logoUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, logoUrl: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-sm text-slate-400 mb-2 font-semibold block">
                            {t('form.section2.templateLabel')}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {availableTemplates.map((tpl) => (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, cardTemplate: tpl.id })
                                    }
                                    className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                                        formData.cardTemplate === tpl.id
                                            ? 'border-indigo-500 bg-indigo-950/50 ring-2 ring-indigo-500/30'
                                            : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="font-bold text-sm mb-1 text-white">
                                        {tpl.name}
                                    </div>
                                    <div className="text-xs text-slate-400">{tpl.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-white border-b border-slate-700 pb-2 pt-4">
                        {t('form.section3.title')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder={t('form.section3.adminName')}
                            required
                            className={inputClass}
                            value={formData.adminName}
                            onChange={(e) =>
                                setFormData({ ...formData, adminName: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder={t('form.section3.adminUsername')}
                            required
                            pattern="^[a-zA-Z0-9_.]+$"
                            title={t('form.section3.adminUsernameTitle')}
                            className={inputClass}
                            value={formData.adminUsername}
                            onChange={(e) =>
                                setFormData({ ...formData, adminUsername: e.target.value.toLowerCase().trim() })
                            }
                        />
                        <input
                            type="email"
                            placeholder={t('form.section3.adminEmail')}
                            required
                            className={inputClass}
                            value={formData.adminEmail}
                            onChange={(e) =>
                                setFormData({ ...formData, adminEmail: e.target.value })
                            }
                        />
                    </div>
                    <input
                        type="password"
                        placeholder={t('form.section3.adminPassword')}
                        required
                        className={inputClass}
                        value={formData.adminPassword}
                        onChange={(e) =>
                            setFormData({ ...formData, adminPassword: e.target.value })
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 mt-4 transition disabled:opacity-50"
                    >
                        {loading ? t('form.submit.loading') : t('form.submit.default')}
                    </button>
                </form>
            )}

            <div className="bg-slate-900 rounded-2xl border border-indigo-900/40 shadow-xl overflow-hidden">
                {fetching ? (
                    <p className="p-8 text-center text-slate-500">{t('list.loading')}</p>
                ) : companies.length === 0 && !showForm ? (
                    <p className="p-10 text-center text-slate-500 border-2 border-dashed border-slate-700 m-6 rounded-xl">
                        {t('list.empty')}
                    </p>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {companies.map((company) => (
                            <div
                                key={company.id}
                                className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-slate-800/50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center border border-slate-600 shadow-inner shrink-0"
                                        style={{
                                            backgroundColor: company.primaryColor || '#000000',
                                        }}
                                    >
                                        {company.logoUrl ? (
                                            <img
                                                src={company.logoUrl}
                                                alt="logo"
                                                className="w-8 h-8 object-contain bg-white rounded-full p-1"
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-xs">
                                                IMG
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="font-bold text-lg text-white">
                                                {company.name}
                                            </h3>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                                    company.systemType === 'STAMPS'
                                                        ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50'
                                                        : 'bg-violet-900/50 text-violet-300 border border-violet-700/50'
                                                }`}
                                            >
                                                {company.systemType === 'STAMPS'
                                                    ? t('list.badges.stamps')
                                                    : t('list.badges.points')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {t('list.labels.template')}{' '}
                                            <span className="font-semibold text-slate-300">
                                                {CARD_TEMPLATES.find(
                                                    (t) => t.id === company.cardTemplate
                                                )?.name || t('list.labels.standard')}
                                            </span>
                                        </p>
                                        {company.users[0] && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {t('list.labels.manager')} {company.users[0].name} (
                                                {company.users[0].email})
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className="self-start sm:self-center bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 text-xs font-bold px-3 py-1.5 rounded-full">
                                    {t('list.labels.customers', { count: company._count.customers })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}