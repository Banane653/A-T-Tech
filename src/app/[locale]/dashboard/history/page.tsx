'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

type Transaction = {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    customer: { firstName: string; lastName: string | null; email: string };
    merchantUser: { name: string } | null; 
};

// On garde les couleurs ici car c'est de la logique visuelle (CSS)
const typeColors: Record<string, string> = {
    EARN: 'text-green-700 bg-green-50',
    SPEND: 'text-orange-700 bg-orange-50',
    RESET: 'text-purple-700 bg-purple-50',
};

export default function HistoryPage() {
    const t = useTranslations('MerchantHistory');
    const locale = useLocale();
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Adaptation de la localisation de la date selon la langue en cours
    const dateLocale = locale === 'en' ? 'en-US' : locale === 'nl' ? 'nl-NL' : 'fr-FR';

    useEffect(() => {
        fetch('/api/admin/transactions')
            .then((res) => res.json())
            .then((data) => {
                if (data.transactions) setTransactions(data.transactions);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString(dateLocale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const customerName = (t: Transaction) =>
        `${t.customer.firstName}${t.customer.lastName ? ` ${t.customer.lastName}` : ''}`;

    // Fonction de sécurité pour traduire uniquement les types qu'on connaît
    const getTranslatedType = (type: string) => {
        const knownTypes = ['EARN', 'SPEND', 'RESET'];
        if (knownTypes.includes(type)) return t(`types.${type}`);
        return type;
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-500 mb-8">{t('subtitle')}</p>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-8 text-center text-gray-400">{t('loading')}</p>
                ) : transactions.length === 0 ? (
                    <p className="p-8 text-center text-gray-400">{t('empty')}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left p-4 font-semibold text-gray-600">{t('columns.date')}</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">{t('columns.customer')}</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">{t('columns.employee')}</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">{t('columns.action')}</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">{t('columns.amount')}</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">{t('columns.description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {formatDate(tx.createdAt)}
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">
                                            {customerName(tx)}
                                        </td>
                                        <td className="p-4 font-medium text-blue-600">
                                            {tx.merchantUser ? (
                                                tx.merchantUser.name
                                            ) : (
                                                <span className="text-gray-400 italic font-normal">
                                                    {t('deletedEmployee')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    typeColors[tx.type] || 'text-gray-600 bg-gray-50'
                                                }`}
                                            >
                                                {getTranslatedType(tx.type)}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {tx.type === 'SPEND' ? '-' : '+'}
                                            {tx.amount}
                                        </td>
                                        <td className="p-4 text-gray-600">{tx.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}