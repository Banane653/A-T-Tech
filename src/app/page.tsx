'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
// 1. IMPORT de la librairie d'effet 3D
import Tilt from 'react-parallax-tilt';
import { useState, useEffect } from 'react';
import PricingSection from '@/components/ui/pricing';

export default function HomePage() {
  // === NEW: DEMO STATE FOR INTERACTIVE MOCKUP ===
  const [demoPoints, setDemoPoints] = useState(0);

  // === NEW: EFFECT TO SIMULATE INITIAL POINTS INCREASE ===
  useEffect(() => {
    // Start at 0 and count up quickly on load
    let currentPoints = 0;
    const targetPoints = 1240;
    const increment = 30; // Amount per step
    const speed = 25; // Speed (ms)

    const timer = setInterval(() => {
      currentPoints += increment;
      if (currentPoints >= targetPoints) {
        setDemoPoints(targetPoints);
        clearInterval(timer);
      } else {
        setDemoPoints(currentPoints);
      }
    }, speed);

    return () => clearInterval(timer);
  }, []); // Only run on initial mount

  const handleAddPoints = () => {
    setDemoPoints((prev) => prev + 100);
  };
  // === END DEMO STATE ===
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter">A-T-TECH.</div>
        <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-600">
          <a href="#features" className="hover:text-black transition">Fonctionnalités</a>
          <a href="#how-it-works" className="hover:text-black transition">Comment ça marche</a>
          <a href="#pricing" className="hover:text-black transition">Tarifs</a>
        </nav>
        <div className="flex gap-4">
          <Link href="/login" className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition">
            Se connecter
          </Link>
          <Link href="/register" className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-full transition">
            Essai gratuit
          </Link>
        </div>
      </header>

{/* 2. HERO SECTION DYNAMIQUE ET INTERACTIVE */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Colonne de Gauche : Textes */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium bg-gray-100 rounded-full text-gray-800">
            <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
            Google Wallet & Apple Wallet disponibles
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            La fidélité qui vit dans la <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-black">poche de vos clients.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg">
            Transformez chaque visite en raison de revenir. Créez une carte de fidélité à votre image en quelques minutes, sans aucune application à télécharger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="px-8 py-4 text-base font-bold text-white bg-black hover:bg-gray-800 rounded-full text-center transition shadow-lg shadow-black/20 hover:shadow-black/30">
              Démarrer gratuitement
            </Link>
            <a href="#how-it-works" className="px-8 py-4 text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full text-center transition">
              Comment ça marche
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
            <span>✓ Sans carte bancaire</span>
            <span>✓ Prêt en 10 min</span>
            <span>✓ Sans engagement</span>
          </div>
        </div>
        
        {/* Colonne de Droite : MOCKUP INTERACTIF */}
        <div className="relative flex justify-center items-center py-12 md:py-0">
          
          <Tilt 
            tiltMaxAngleX={10} 
            tiltMaxAngleY={10} 
            perspective={1000} 
            scale={1.02} 
            glareEnable={true} 
            glareMaxOpacity={0.2} 
            glareColor="#ffffff" 
            glarePosition="all" 
            glareBorderRadius="3rem"
            className="relative z-10"
          >
            {/* Le téléphone */}
            <div className="w-64 h-[500px] bg-black border-[14px] border-black rounded-[3rem] shadow-2xl overflow-hidden relative transform rotate-1">
              <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-xl w-32 mx-auto z-20"></div>
              
              {/* L'écran du téléphone (Nouveau Design Premium) */}
              <div className="absolute inset-0 bg-gray-50 p-3 pt-8 overflow-hidden rounded-[2rem]">
                  <div className="h-full w-full bg-black rounded-2xl p-5 text-white shadow-inner flex flex-col justify-between border border-gray-800 relative overflow-hidden">
                      {/* Effet reflet sur la carte */}
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                      <div className="flex justify-between items-start z-10">
                          <div>
                              <h3 className="font-bold text-base tracking-wide">A-T-TECH.</h3>
                              <p className="text-[10px] text-gray-400 mt-0.5 tracking-wider">CARTE PRIVILÈGE</p>
                          </div>
                          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">VIP</div>
                      </div>
                      
                      {/* === AFFICHAGE DYNAMIQUE DES POINTS === */}
                      <div className="text-center my-6 z-10">
                          {/* On utilise la variable `demoPoints` ici */}
                          <span className="text-6xl font-black tracking-tighter text-yellow-400 drop-shadow-md transition-all duration-300">
                              {demoPoints.toLocaleString()}
                          </span>
                          <p className="text-xs font-medium mt-1 tracking-widest text-gray-400 uppercase">Points de fidélité</p>
                      </div>
                      
                      <div className="space-y-2 border-t border-gray-800 pt-4 z-10 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Membre</p>
                            <p className="font-semibold text-sm">Sophie</p>
                          </div>
                          {/* Faux Code QR stylisé */}
                          <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
                            <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80"></div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </Tilt>

          {/* === BOUTON D'INTERACTION === */}
          <div className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 z-30 animate-float">
              {/* Au clic, on déclenche la fonction handleAddPoints */}
              <button 
                  onClick={handleAddPoints}
                  className="bg-white border-2 border-black text-black p-4 rounded-2xl shadow-xl flex flex-col gap-1 items-center hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                  <span className="text-2xl group-hover:rotate-12 transition-transform">🪄</span>
                  <p className="text-sm font-bold whitespace-nowrap">Scanner le client</p>
                  <p className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">+ 100 points</p>
              </button>
          </div>

          {/* === ÉLÉMENTS FLOTTANTS (Badges) === */}
          
          {/* Badge 1 : "Café offert débloqué" (Faut style iOS Notification) */}
          <div className="absolute -top-4 -right-10 md:-right-16 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex gap-3 items-center z-20 animate-float">
              <div className="text-3xl">☕</div>
              <div>
                  <p className="text-xs font-bold text-gray-900">Félicitations Sophie !</p>
                  <p className="text-xs text-gray-500">Votre café offert est débloqué.</p>
              </div>
          </div>

          {/* Badge 2 : "+1 Tampon ajouté" (Style confirmation) */}
          <div className="absolute bottom-16 -left-12 md:-left-20 bg-green-500 text-white p-3 rounded-full shadow-lg flex gap-2.5 items-center z-20 animate-float-delay">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <p className="text-sm font-bold pr-2">+1 tampon ajouté</p>
          </div>

          {/* Fond décoratif (Cercle de couleur) */}
          <div className="absolute w-96 h-96 bg-indigo-50 rounded-full -z-10 opacity-60"></div>
        </div>
      </section>

      {/* ... Le reste des sections (Logos, Features, How it works, Pricing, CTA) reste identique à la version précédente ... */}
      
      {/* 3. SOCIAL PROOF / LOGOS */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <p className="text-center text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Conçu pour les commerces indépendants</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale font-bold text-xl">
          <span>Maison Rose</span>
          <span>NORTHWIND</span>
          <span>Atlas & Co.</span>
          <span>FORMA</span>
          <span>Olive Bistro</span>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Tout ce qu'il vous faut</h2>
          <h3 className="text-3xl md:text-4xl font-bold">Un vrai programme de fidélité, sans application à développer.</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard icon="📱" title="Apple & Google Wallet" desc="Une carte, deux plateformes. Les clients l'ajoutent en deux clics, sans application à télécharger." />
          <FeatureCard icon="🔔" title="Offres sur écran verrouillé" desc="Envoyez des offres qui s'affichent directement sur l'écran verrouillé. 5x plus efficace qu'un SMS." />
          <FeatureCard icon="⭐" title="Tampons ou Points" desc="Choisissez le programme qui vous correspond. Les récompenses se mettent à jour en direct." />
          <FeatureCard icon="📊" title="Des statistiques utiles" desc="Voyez qui revient et qui décroche. Analysez votre activité sans avoir besoin d'un doctorat." />
          <FeatureCard icon="⚡" title="Prêt en 10 minutes" desc="Téléchargez votre logo, choisissez vos couleurs. Aucun code ni développeur requis." />
          <FeatureCard icon="🔄" title="Outils Gérants" desc="Scannez depuis n'importe quel smartphone ou tablette pour ajouter des points instantanément." />
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Comment ça marche</h2>
            <h3 className="text-3xl md:text-4xl font-bold">De zéro à carte de fidélité,<br/> avant votre prochain café.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number="1" title="Créez votre carte" desc="Ajoutez votre logo, choisissez votre couleur et définissez votre système de récompense." />
            <StepCard number="2" title="Partagez le lien" desc="Imprimez un QR code pour le comptoir ou mettez le lien dans votre bio Instagram." />
            <StepCard number="3" title="Fidélisez" desc="Scannez la carte des clients lors de leur passage en caisse pour les récompenser." />
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section id="pricing" className="bg-white">
        <PricingSection />
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-24 bg-black text-white text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl mx-auto">Vos meilleurs clients n'attendent qu'une raison de revenir.</h2>
        <p className="text-gray-400 mb-10 max-w-lg mx-auto">Gratuit, à vos couleurs, en ligne en quelques minutes. Sans carte bancaire, sans engagement.</p>
        <Link href="/register" className="inline-block px-8 py-4 text-base font-bold text-black bg-white hover:bg-gray-100 rounded-full transition shadow-lg shadow-white/10">
          Créer ma première carte
        </Link>
      </section>

      {/* FOOTER GLOBAL */}
      <Footer />
    </div>
  );
}

// Composants locaux pour nettoyer le code
function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h4 className="text-lg font-bold mb-2">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative p-8 bg-white rounded-3xl border border-gray-100 shadow-sm transition hover:shadow-lg">
      <div className="absolute -top-5 left-8 w-10 h-10 bg-black text-white font-bold flex items-center justify-center rounded-full text-lg shadow-lg">
        {number}
      </div>
      <h4 className="text-xl font-bold mb-3 mt-2">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}