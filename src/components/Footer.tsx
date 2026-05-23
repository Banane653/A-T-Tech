import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 shrink-0">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <span>© {new Date().getFullYear()} A-T-Tech Fidelity. Tous droits réservés.</span>
                
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
            </div>
        </footer>
    );
}