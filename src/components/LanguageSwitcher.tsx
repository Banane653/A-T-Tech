'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
    // 1. On récupère la langue actuelle (fr, en, nl)
    const currentLocale = useLocale();
    
    // 2. Nos outils intelligents pour changer d'URL
    const router = useRouter();
    const pathname = usePathname();
    
    // 3. useTransition permet à Next.js de charger la nouvelle langue en arrière-plan 
    // sans bloquer l'interface
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        
        startTransition(() => {
            // On remplace l'URL actuelle en gardant le même chemin, 
            // mais en injectant la nouvelle langue !
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="relative inline-block">
            <select
                defaultValue={currentLocale}
                disabled={isPending}
                onChange={onSelectChange}
                className="appearance-none bg-transparent border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-black cursor-pointer disabled:opacity-50 transition-colors"
            >
                <option value="fr">🇫🇷 FR</option>
                <option value="en">🇬🇧 EN</option>
                <option value="nl">🇳🇱 NL</option>
            </select>
            {/* Petite flèche personnalisée pour remplacer celle par défaut du navigateur */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}