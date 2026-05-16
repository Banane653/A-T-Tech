'use client';

import { useState, useEffect } from 'react';

type Customer = {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    birthDate: string | null;
    createdAt: string;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatBirthDate(value: string | null) {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function escapeCsvField(value: string) {
    if (value.includes('"') || value.includes(';') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function exportCustomersCsv(customers: Customer[]) {
    const headers = ['Prénom', 'Nom', 'Email', 'Date de naissance', "Date d'inscription"];
    const rows = customers.map((c) => [
        c.firstName,
        c.lastName ?? '',
        c.email,
        formatBirthDate(c.birthDate),
        formatDate(c.createdAt),
    ]);

    const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsvField).join(';'))
        .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients.csv';
    link.click();
    URL.revokeObjectURL(url);
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/customers')
            .then((res) => res.json())
            .then((data) => {
                if (data.customers) setCustomers(data.customers);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Clients</h1>
                    <p className="text-gray-500">
                        Liste de tous les clients fidélisés de votre commerce.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => exportCustomersCsv(customers)}
                    disabled={loading || customers.length === 0}
                    className="shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Exporter en CSV
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-8 text-center text-gray-400">Chargement...</p>
                ) : customers.length === 0 ? (
                    <p className="p-8 text-center text-gray-400">Aucun client inscrit pour le moment.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left p-4 font-semibold text-gray-600">Prénom</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Nom</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">
                                        Date de naissance
                                    </th>
                                    <th className="text-left p-4 font-semibold text-gray-600">
                                        Date d&apos;inscription
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="p-4 font-medium text-gray-800">
                                            {customer.firstName}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {customer.lastName ?? '—'}
                                        </td>
                                        <td className="p-4 text-gray-600">{customer.email}</td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {formatBirthDate(customer.birthDate)}
                                        </td>
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {formatDate(customer.createdAt)}
                                        </td>
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
