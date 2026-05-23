'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { useSearchParams } from 'next/navigation'; // 👈 On importe l'outil de Next.js pour lire les paramètres (?companyId=...)
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
    const currentLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); // 👈 On initialise l'outil

    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        
        startTransition(() => {
            // 1. Convertir les paramètres actuels en chaîne de texte (ex: "companyId=123")
            const currentParams = searchParams.toString();
            
            // 2. Si on a des paramètres, on les ajoute à la suite du chemin avec un "?"
            const targetPath = currentParams 
                ? `${pathname}?${currentParams}` 
                : pathname;

            // 3. On redirige proprement vers la même page avec les mêmes paramètres mais dans la nouvelle langue !
            router.replace(targetPath, { locale: nextLocale });
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
                <option value="fr">FR</option>
                <option value="en">EN</option>
                <option value="nl">NL</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}