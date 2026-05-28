import { Link } from '@/navigation';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
    const t = useTranslations('Privacy');

    // Configuration des composants réutilisables pour t.rich
    const richConfig = {
        strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
        a: (chunks: React.ReactNode) => (
            <a href="mailto:contact@cardeo.be" className="text-blue-600 hover:underline">
                {chunks}
            </a>
        ),
        aBold: (chunks: React.ReactNode) => (
            <a href="mailto:contact@cardeo.be" className="text-blue-600 hover:underline font-semibold">
                {chunks}
            </a>
        )
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-sm p-8 my-12 border border-gray-100">
                <Link 
                    href="/" 
                    className="text-sm font-semibold text-gray-600 hover:text-black transition inline-flex items-center gap-2 mb-6"
                >
                    ← {t('backToHome')}
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
                <p className="text-sm text-gray-500 mb-8">{t('lastUpdated')}</p>

                <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('section1.title')}</h2>
                        <p>{t.rich('section1.content', richConfig)}</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('section2.title')}</h2>
                        <p className="mb-2">{t('section2.intro')}</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li>{t.rich('section2.list.0', richConfig)}</li>
                            <li>{t.rich('section2.list.1', richConfig)}</li>
                            <li>{t.rich('section2.list.2', richConfig)}</li>
                        </ul>
                        <p>{t('section2.outro')}</p>
                        <p className="mt-2 text-gray-600 italic">{t('section2.legalBase')}</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('section3.title')}</h2>
                        <p className="mb-2">{t('section3.intro')}</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>{t.rich('section3.list.0', richConfig)}</li>
                            <li>{t.rich('section3.list.1', richConfig)}</li>
                            <li>{t.rich('section3.list.2', richConfig)}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('section4.title')}</h2>
                        <p>{t.rich('section4.content', richConfig)}</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('section5.title')}</h2>
                        <p>{t.rich('section5.content', richConfig)}</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">{t('section6.title')}</h2>
                        <p className="mb-2">{t.rich('section6.intro', richConfig)}</p>
                        <p>{t('section6.outro')}</p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}