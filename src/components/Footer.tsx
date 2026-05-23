// 1. On importe notre Link intelligent
import { Link } from '@/navigation'; 
import LanguageSwitcher from '@/components/LanguageSwitcher';
// 2. On importe l'outil de traduction
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 shrink-0">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {/* On garde l'année dynamique en JavaScript, et on traduit le reste */}
                <span>© {new Date().getFullYear()} A-T-Tech Fidelity. {t('rights')}</span>
                
                <Link href="/legal/confidentialite" className="hover:text-black font-semibold transition">
                    {t('privacy')}
                </Link>
                
                <span className="hidden sm:inline text-gray-300">•</span>

                <Link href="/legal/cgv" className="hover:text-black font-semibold transition">
                    {t('terms')}
                </Link>
                
                <span className="hidden sm:inline text-gray-300">•</span>

                <Link href="/contact" className="hover:text-black font-semibold transition">
                    {t('contact')}
                </Link>

                <span className="hidden sm:inline text-gray-300">•</span>

                <LanguageSwitcher />
            </div>
        </footer>
    );
}