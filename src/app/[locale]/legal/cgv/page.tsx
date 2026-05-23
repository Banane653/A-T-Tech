import Footer from '@/components/Footer';
import { useTranslations, useLocale } from 'next-intl';

export default function CGVPage() {
    const t = useTranslations('Terms');
    const locale = useLocale();

    const dateLocale = locale === 'en' ? 'en-US' : locale === 'nl' ? 'nl-NL' : 'fr-FR';

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-gray-700 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>
                
                <p className="text-sm text-gray-500">
                    {t('lastUpdated')} {new Date().toLocaleDateString(dateLocale)}
                </p>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">{t('section1.title')}</h2>
                    <p>
                        {t.rich('section1.content', {
                            strong: (chunks) => <strong>{chunks}</strong>
                        })}
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">{t('section2.title')}</h2>
                    <p>{t('section2.content')}</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">{t('section3.title')}</h2>
                    <p>{t('section3.intro')}</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>{t('section3.list.0')}</li>
                        <li>{t('section3.list.1')}</li>
                        <li>{t('section3.list.2')}</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">{t('section4.title')}</h2>
                    <p>{t('section4.intro')}</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>{t('section4.list.0')}</li>
                        <li>{t('section4.list.1')}</li>
                        <li>{t('section4.list.2')}</li>
                    </ul>
                    <p>{t('section4.outro')}</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">{t('section5.title')}</h2>
                    <p>{t('section5.content')}</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">{t('section6.title')}</h2>
                    <p>{t('section6.content')}</p>
                </section>
            </div>
            <Footer />
        </main>
    );
}