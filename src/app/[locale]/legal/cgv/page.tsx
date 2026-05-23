import Footer from '@/components/Footer';
import Link from 'next/link';


export default function CGVPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-gray-700 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation et de Vente</h1>
                
                <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">1. Objet</h2>
                    <p>
                        Les présentes Conditions Générales définissent les règles d'utilisation de la plateforme <strong>Cardeo</strong>. 
                        Cardeo fournit une solution logicielle (SaaS) permettant aux commerçants de créer et gérer des programmes de fidélité dématérialisés compatibles avec Apple Wallet et Google Wallet.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">2. Accès au Service</h2>
                    <p>
                        L'accès à l'interface d'administration est réservé aux commerçants ayant souscrit un abonnement. 
                        Le commerçant est seul responsable de la confidentialité de ses identifiants et de l'accès accordé à ses employés (comptes collaborateurs).
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">3. Responsabilités du Commerçant</h2>
                    <p>Le commerçant partenaire s'engage à :</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Ne pas utiliser la plateforme à des fins frauduleuses ou illégales.</li>
                        <li>Honorer les récompenses de fidélité (tampons, points) acquises légitimement par ses clients finaux via le système Cardeo.</li>
                        <li>Recueillir le consentement libre et éclairé de ses clients lors de leur inscription en magasin.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">4. Disponibilité et Limite de Responsabilité</h2>
                    <p>
                        Cardeo s'efforce de maintenir le service accessible 24h/24 et 7j/7. Toutefois, notre responsabilité ne saurait être engagée en cas de :
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Coupure de réseau internet côté commerçant ou client.</li>
                        <li>Modification des politiques restrictives imposées par les sociétés tierces (Apple Inc. et Google LLC) concernant leurs applications Wallet.</li>
                        <li>Maintenance technique programmée (dont les utilisateurs seront informés au préalable).</li>
                    </ul>
                    <p>
                        Cardeo fournit un outil logiciel et n'est en aucun cas responsable des litiges commerciaux pouvant survenir entre un commerçant et son client final concernant les récompenses.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">5. Propriété Intellectuelle</h2>
                    <p>
                        La plateforme, son code source, son design, et l'architecture logicielle restent la propriété intellectuelle exclusive de Cardeo. 
                        Les logos et couleurs intégrés par les commerçants restent la propriété des commerçants respectifs.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">6. Modifications</h2>
                    <p>
                        Cardeo se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des mises à jour majeures via leur tableau de bord ou par e-mail.
                    </p>
                </section>
            </div>
            <Footer />
        </main>
    );
}