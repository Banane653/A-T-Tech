'use client';

import { Link, usePathname, useRouter } from '@/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// On utilise "labelKey" pour faire le pont avec les dictionnaires
const navItems = [
    { href: '/scanner', labelKey: 'scanner', icon: '📷' },
    { href: '/dashboard/rewards', labelKey: 'rewards', icon: '🎁' },
    { href: '/dashboard/history', labelKey: 'history', icon: '📋' },
    { href: '/dashboard/stats', labelKey: 'stats', icon: '📊' },
    { href: '/dashboard/customers', labelKey: 'customers', icon: '🤝' },
    { href: '/dashboard', labelKey: 'team', icon: '👥', exact: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('MerchantLayout');
    const pathname = usePathname();
    const router = useRouter();
    const [systemType, setSystemType] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/api/admin/company')
            .then((res) => res.json())
            .then((data) => {
                if (data.company) {
                    setSystemType(data.company.systemType);
                }
            })
            .catch(() => {
                // En cas d'erreur silencieuse, on ne fait rien
            });
    }, []);

    // Fermer le menu automatiquement quand on change de page sur mobile
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            
            {/* EN-TÊTE MOBILE (Visible uniquement sur mobile) */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 shrink-0 shadow-sm z-30">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-900">{t('title')}</h1>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="text-gray-600 hover:text-black p-1"
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
                    className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR (Rétractable sur mobile, fixe sur desktop) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 
                transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
                md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{t('title')}</h1>
                        <p className="text-xs text-gray-500 mt-1">{t('subtitle')}</p>
                    </div>
                    {/* Bouton Fermer sur mobile */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-gray-400 hover:text-black"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.href === '/dashboard/rewards' && systemType !== 'POINTS') {
                            return null;
                        }
                        const linkActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                    linkActive
                                        ? 'bg-black text-white' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span>{item.icon}</span>
                                {t(`nav.${item.labelKey}`)}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* CONTENU PRINCIPAL */}
            <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}