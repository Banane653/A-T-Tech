'use client';

import { useState, useEffect } from 'react';

// 👉 NOUVEAU : On ajoute merchantUser dans le type
type Transaction = {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    customer: { firstName: string; lastName: string | null; email: string };
    merchantUser: { name: string } | null; 
};

const typeLabels: Record<string, string> = {
    EARN: 'Gain',
    SPEND: 'Dépense',
    RESET: 'Réinitialisation',
};

const typeColors: Record<string, string> = {
    EARN: 'text-green-700 bg-green-50',
    SPEND: 'text-orange-700 bg-orange-50',
    RESET: 'text-purple-700 bg-purple-50',
};

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/transactions')
            .then((res) => res.json())
            .then((data) => {
                if (data.transactions) setTransactions(data.transactions);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const customerName = (t: Transaction) =>
        `${t.customer.firstName}${t.customer.lastName ? ` ${t.customer.lastName}` : ''}`;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique</h1>
            <p className="text-gray-500 mb-8">Toutes les transactions de votre commerce.</p>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-8 text-center text-gray-400">Chargement...</p>
                ) : transactions.length === 0 ? (
                    <p className="p-8 text-center text-gray-400">Aucune transaction pour le moment.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Client</th>
                                    {/* 👉 NOUVEAU : En-tête de la colonne Employé */}
                                    <th className="text-left p-4 font-semibold text-gray-600">Employé</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Action</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Montant</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Description</th>
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
                                        {/* 👉 NOUVEAU : Affichage du nom de l'employé ou du fallback */}
                                        <td className="p-4 font-medium text-blue-600">
                                            {tx.merchantUser ? (
                                                tx.merchantUser.name
                                            ) : (
                                                <span className="text-gray-400 italic font-normal">Ancien employé</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    typeColors[tx.type] || 'text-gray-600 bg-gray-50'
                                                }`}
                                            >
                                                {typeLabels[tx.type] || tx.type}
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