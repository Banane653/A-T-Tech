'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
    { href: '/scanner', label: 'Scanner', icon: '📷' },
    { href: '/dashboard/rewards', label: 'Catalogue Cadeaux', icon: '🎁' },
    { href: '/dashboard/history', label: 'Historique', icon: '📋' },
    { href: '/dashboard', label: 'Mon Équipe', icon: '👥', exact: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-lg font-bold text-gray-900">Espace Gérant</h1>
                    <p className="text-xs text-gray-500 mt-1">Fidelity Wallet</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
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
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
