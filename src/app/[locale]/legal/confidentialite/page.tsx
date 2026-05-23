import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
            {/* Contenu principal */}
            <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-sm p-8 my-12 border border-gray-100">
                <Link 
                    href="/" 
                    className="text-sm font-semibold text-gray-600 hover:text-black transition inline-flex items-center gap-2 mb-6"
                >
                    ← Retour à l'accueil
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
                <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : Mai 2026</p>

                <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">1. Responsable du traitement</h2>
                        <p>
                            Les données personnelles collectées sur ce service sont traitées par <strong>Tristan Hourman de Tobel</strong>, agissant en tant qu'indépendant, créateur et gestionnaire de la solution A-T-Tech Fidelity. Pour toute question relative à la protection de vos données, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:tristanhdtb@hotmail.com" className="text-blue-600 hover:underline">tristanhdtb@hotmail.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">2. Données collectées et finalité</h2>
                        <p className="mb-2">Afin de vous fournir votre carte de fidélité numérique, nous collectons les informations suivantes :</p>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li><strong>Prénom et Nom :</strong> pour personnaliser votre carte.</li>
                            <li><strong>Adresse e-mail :</strong> pour identifier votre compte de manière unique.</li>
                            <li><strong>Date de naissance :</strong> pour vous faire bénéficier d'offres d'anniversaire de la part de vos commerçants.</li>
                        </ul>
                        <p>
                            Ces données sont exclusivement utilisées pour la création, la gestion et l'affichage de votre carte de fidélité via Apple Wallet et Google Pay, ainsi que pour permettre au commerçant de mettre à jour votre solde de points ou de tampons.
                        </p>
                        {/* 👇 NOUVEAU : La base légale 👇 */}
                        <p className="mt-2 text-gray-600 italic">
                            Base légale : Le traitement de ces données repose sur votre consentement explicite lors de votre inscription et sur la nécessité d'exécuter le service de fidélité que vous avez sollicité.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">3. Hébergement et Sous-traitants (Stack Technique)</h2>
                        <p className="mb-2">
                            Nous accordons une grande importance à la sécurité de vos données. Vos informations ne sont jamais revendues à des tiers. Pour faire fonctionner le service, nous nous appuyons sur des infrastructures techniques sécurisées :
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Supabase :</strong> Hébergement sécurisé de la base de données.</li>
                            <li><strong>Vercel :</strong> Hébergement de l'application web.</li>
                            <li><strong>Apple Wallet & Google Pay :</strong> Services tiers permettant la génération et l'affichage du pass cryptographique sur votre smartphone.</li>
                        </ul>
                    </section>

                    {/* 👇 NOUVEAU : Section Cookies 👇 */}
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">4. Utilisation des Cookies</h2>
                        <p>
                            Notre plateforme est conçue pour respecter votre vie privée. Nous n'utilisons <strong>aucun cookie de traçage ou publicitaire</strong>. Les seuls cookies utilisés sont strictement nécessaires au fonctionnement technique du site (par exemple : le maintien de la session de connexion sécurisée pour les gérants et employés). Par conséquent, aucun consentement préalable pour les cookies n'est requis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">5. Durée de conservation</h2>
                        <p>
                            Vos données personnelles sont conservées de manière sécurisée pendant toute la durée d'utilisation du service. En cas d'inactivité prolongée (aucun point ou tampon ajouté), vos données et votre carte de fidélité seront <strong>automatiquement supprimées après une période de 2 ans</strong> suivant votre dernière activité.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">6. Vos droits (RGPD)</h2>
                        <p className="mb-2">
                            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles. Vous pouvez exercer ces droits à tout moment, ou demander la suppression définitive de votre carte de fidélité, en envoyant un e-mail à : <a href="mailto:tristanhdtb@hotmail.com" className="text-blue-600 hover:underline font-semibold">tristanhdtb@hotmail.com</a>.
                        </p>
                        {/* 👇 NOUVEAU : Le droit de recours 👇 */}
                        <p>
                            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous avez la possibilité d'introduire une réclamation auprès de l'Autorité de protection des données (APD) en Belgique.
                        </p>
                    </section>
                </div>
            </div>

            {/* Footer inclus directement en bas de cette page */}
            <Footer />
        </main>
    );
}