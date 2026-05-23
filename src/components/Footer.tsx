// 1. On importe notre Link intelligent au lieu de celui de Next.js
import { Link } from '@/navigation'; 
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 shrink-0">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <span>© {new Date().getFullYear()} A-T-Tech Fidelity. Tous droits réservés.</span>
                
                {/* 2. On remet des <Link> ! next-intl s'occupe de rajouter la langue automatiquement */}
                <Link href="/legal/confidentialite" className="hover:text-black font-semibold transition">
                    Politique de Confidentialité
                </Link>
                
                <span className="hidden sm:inline text-gray-300">•</span>

                <Link href="/legal/cgv" className="hover:text-black font-semibold transition">
                    CGU / CGV
                </Link>
                
                <span className="hidden sm:inline text-gray-300">•</span>

                <Link href="/contact" className="hover:text-black font-semibold transition">
                    Contact
                </Link>

                <span className="hidden sm:inline text-gray-300">•</span>

                <LanguageSwitcher />
            </div>
        </footer>
    );
}