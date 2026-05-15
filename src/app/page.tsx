import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      
      {/* 🚀 NAVBAR (Barre de navigation) */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              {/* Remplace par ton logo si tu en as un */}
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">AT</div>
              <span className="font-bold text-xl tracking-tight">A-T-Tech <span className="text-blue-600">Fidélité</span></span>
            </div>
            <div>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition-colors shadow-sm"
              >
                Espace Gérant 🔒
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 💥 HERO SECTION (La phrase d'accroche) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          La carte de fidélité qui ne se <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">perd jamais.</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Digitalisez votre programme de fidélité directement dans <b>Google Wallet</b> et <b>Apple Wallet</b>. Zéro application à télécharger pour vos clients, 100% à votre image.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="#comment-ca-marche" 
            className="px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Découvrir le fonctionnement
          </Link>
        </div>
      </section>

      {/* ✨ FEATURES (Les points forts) */}
      <section className="bg-white py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">100% Natif</h3>
              <p className="text-gray-600">Vos clients n'ont rien à installer. La carte s'ajoute en un clic dans l'application Wallet déjà présente sur leur smartphone.</p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Design Sur Mesure</h3>
              <p className="text-gray-600">Tampons interactifs (café, pizza, cadeau) ou cartes à points premium. Personnalisez les couleurs et le logo à l'image de votre marque.</p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Mise à jour en temps réel</h3>
              <p className="text-gray-600">Scannez la carte du client à la caisse. Son solde de points ou son animation de tampons se met à jour instantanément sur son téléphone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ HOW IT WORKS */}
      <section id="comment-ca-marche" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">Comment ça marche ?</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex-1">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h4 className="font-bold text-lg mb-2">Configuration</h4>
            <p className="text-gray-500 text-sm">Le commerçant choisit son modèle, ses couleurs et crée son commerce en 2 minutes.</p>
          </div>
          <div className="hidden md:block text-gray-300">➡</div>
          <div className="flex-1">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h4 className="font-bold text-lg mb-2">Le client s'inscrit</h4>
            <p className="text-gray-500 text-sm">Via un QR Code posé sur le comptoir, le client ajoute la carte à son Wallet.</p>
          </div>
          <div className="hidden md:block text-gray-300">➡</div>
          <div className="flex-1">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h4 className="font-bold text-lg mb-2">Fidélisation</h4>
            <p className="text-gray-500 text-sm">À chaque passage, le commerçant scanne le code-barres pour récompenser son client.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} A-T-Tech Fidélité. Tous droits réservés.</p>
      </footer>
    </div>
  );
}