import { Link } from '@/navigation'; 
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="w-full bg-gray-50 border-t border-gray-200 pt-12 pb-8 text-sm text-gray-500 shrink-0 mt-auto">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                
                {/* Grille principale des colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    
                    {/* Colonne 1 (Plus large) : Marque Cardeo et Description */}
                    <div className="md:col-span-2">
                        <Link href="/" className="text-2xl font-black text-black tracking-tighter mb-4 inline-block">
                            Cardeo.
                        </Link>
                        <p className="leading-relaxed max-w-sm">
                            {t('description')}
                        </p>
                    </div>

                    {/* Colonne 2 : Entreprise (Contact) */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">{t('sections.company')}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/contact" className="hover:text-black transition">
                                    {t('contact')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Légal (Confidentialité & CGV) */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">{t('sections.legal')}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/legal/confidentialite" className="hover:text-black transition">
                                    {t('privacy')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/cgv" className="hover:text-black transition">
                                    {t('terms')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bas du footer : Copyright (Cardeo) & Sélecteur de langue */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-gray-200 gap-4">
                    <span>© {new Date().getFullYear()} Cardeo {t('rights')}</span>
                    <LanguageSwitcher />
                </div>
            </div>
        </footer>
    );
}