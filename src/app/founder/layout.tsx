'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
    { href: '/founder', label: 'Vue Globale', icon: '🌍', exact: true },
    { href: '/founder/companies', label: 'Commerces', icon: '🏪' },
];

export default function FounderLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fermer le menu automatiquement quand on change de page sur mobile
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
            
            {/* EN-TÊTE MOBILE (Visible uniquement sur mobile) */}
            <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-indigo-900/40 p-4 shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white">Espace Fondateur</h1>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="text-slate-300 hover:text-white p-1"
                >
                    {/* Icône Burger */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* OVERLAY SOMBRE (Clic pour fermer) */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR (Rétractable sur mobile, fixe sur desktop) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-indigo-900/40 flex flex-col shrink-0 
                transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-indigo-900/30 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-white">Espace Fondateur</h1>
                        <p className="text-xs text-indigo-300/80 mt-1">Super-Admin SaaS</p>
                    </div>
                    {/* Bouton Fermer sur mobile */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const linkActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                    linkActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-indigo-900/30">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/50 rounded-lg transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* CONTENU PRINCIPAL */}
            <main className="flex-1 overflow-auto bg-slate-950">
                {children}
            </main>
        </div>
    );
}