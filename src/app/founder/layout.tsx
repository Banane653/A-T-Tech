'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
    { href: '/founder', label: 'Vue Globale', icon: '🌍', exact: true },
    { href: '/founder/companies', label: 'Commerces', icon: '🏪' },
];

export default function FounderLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <aside className="w-64 bg-slate-900 border-r border-indigo-900/40 flex flex-col shrink-0">
                <div className="p-6 border-b border-indigo-900/30">
                    <h1 className="text-lg font-bold text-white">Espace Fondateur</h1>
                    <p className="text-xs text-indigo-300/80 mt-1">Super-Admin SaaS</p>
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

            <main className="flex-1 overflow-auto bg-slate-950">{children}</main>
        </div>
    );
}
