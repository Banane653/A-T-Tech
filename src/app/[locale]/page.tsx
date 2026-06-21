'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import Tilt from 'react-parallax-tilt';
import { useState, useEffect } from 'react';
import PricingSection from '@/components/ui/pricing';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const [demoPoints, setDemoPoints] = useState(0);
  const t = useTranslations('HomePage');

  useEffect(() => {
    let currentPoints = 0;
    const targetPoints = 1240;
    const increment = 30; 
    const speed = 25; 

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
  }, []); 

  const handleAddPoints = () => {
    setDemoPoints((prev) => prev + 100);
  };
  
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter">CARDEO</div>
        <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-600">
          <a href="#features" className="hover:text-black transition">{t('nav.features')}</a>
          <a href="#how-it-works" className="hover:text-black transition">{t('nav.howItWorks')}</a>
          <a href="#pricing" className="hover:text-black transition">{t('nav.pricing')}</a>
        </nav>
        <div className="flex gap-4">
            <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition-colors shadow-sm"
            >
            {t('nav.login')}
            </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium bg-gray-100 rounded-full text-gray-800">
            <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
            {t('hero.badge')}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            {t('hero.title.part1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-black">{t('hero.title.part2')}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg">
          {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className="px-8 py-4 text-base font-bold text-white bg-black hover:bg-gray-800 rounded-full text-center transition shadow-lg shadow-black/20 hover:shadow-black/30">
              {t('hero.cta.primary')}
            </Link>
            <a href="#how-it-works" className="px-8 py-4 text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full text-center transition">
              {t('hero.cta.secondary')}
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
            <span>{t('hero.perks.perk1')}</span>
            <span>{t('hero.perks.perk2')}</span>
            <span>{t('hero.perks.perk3')}</span>
          </div>
        </div>
        
        {/* Colonne de Droite : MOCKUP */}
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
            <div className="w-64 h-[500px] bg-black border-[14px] border-black rounded-[3rem] shadow-2xl overflow-hidden relative transform rotate-1">
              <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-xl w-32 mx-auto z-20"></div>
              
              <div className="absolute inset-0 bg-gray-50 p-3 pt-8 overflow-hidden rounded-[2rem]">
                  <div className="h-full w-full bg-black rounded-2xl p-5 text-white shadow-inner flex flex-col justify-between border border-gray-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                      <div className="flex justify-between items-start z-10">
                          <div>
                              <h3 className="font-bold text-base tracking-wide">CARDEO</h3>
                              <p className="text-[10px] text-gray-400 mt-0.5 tracking-wider">{t('mockup.cardType')}</p>
                          </div>
                          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">VIP</div>
                      </div>
                      
                      <div className="text-center my-6 z-10">
                          <span className="text-6xl font-black tracking-tighter text-yellow-400 drop-shadow-md transition-all duration-300">
                              {demoPoints.toLocaleString()}
                          </span>
                          <p className="text-xs font-medium mt-1 tracking-widest text-gray-400 uppercase">{t('mockup.pointsLabel')}</p>
                      </div>
                      
                      <div className="space-y-2 border-t border-gray-800 pt-4 z-10 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('mockup.memberLabel')}</p>
                            <p className="font-semibold text-sm">Sophie</p>
                          </div>
                          <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
                            <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80"></div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </Tilt>

          <div className="absolute -top-4 -right-10 md:-right-16 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex gap-3 items-center z-20 animate-float">
              <div className="text-3xl">☕</div>
              <div>
                  <p className="text-xs font-bold text-gray-900">{t('mockup.badge1.title')}</p>
                  <p className="text-xs text-gray-500">{t('mockup.badge1.desc')}</p>
              </div>
          </div>

          <div className="absolute bottom-16 -left-12 md:-left-20 bg-green-500 text-white p-3 rounded-full shadow-lg flex gap-2.5 items-center z-20 animate-float-delay">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <p className="text-sm font-bold pr-2">{t('mockup.badge2')}</p>
          </div>

          <div className="absolute w-96 h-96 bg-indigo-50 rounded-full -z-10 opacity-60"></div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <p className="text-center text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">{t('socialProof.title')}</p>
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
          <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">{t('features.subtitle')}</h2>
          <h3 className="text-3xl md:text-4xl font-bold">{t('features.title')}</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard icon="📱" title={t('features.items.wallet.title')} desc={t('features.items.wallet.desc')} />
          <FeatureCard icon="⭐" title={t('features.items.rewards.title')} desc={t('features.items.rewards.desc')} />
          <FeatureCard icon="📊" title={t('features.items.stats.title')} desc={t('features.items.stats.desc')} />
          <FeatureCard icon="⚡" title={t('features.items.speed.title')} desc={t('features.items.speed.desc')} />
          <FeatureCard icon="🔄" title={t('features.items.tools.title')} desc={t('features.items.tools.desc')} />
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">{t('howItWorks.subtitle')}</h2>
            <h3 className="text-3xl md:text-4xl font-bold" dangerouslySetInnerHTML={{ __html: t('howItWorks.title') }}></h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number="1" title={t('howItWorks.steps.step1.title')} desc={t('howItWorks.steps.step1.desc')} />
            <StepCard number="2" title={t('howItWorks.steps.step2.title')} desc={t('howItWorks.steps.step2.desc')} />
            <StepCard number="3" title={t('howItWorks.steps.step3.title')} desc={t('howItWorks.steps.step3.desc')} />
          </div>
        </div>
      </section>

      {/* 6. PRICING */}
      <section id="pricing" className="bg-white">
        <PricingSection />
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="py-24 bg-black text-white text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl mx-auto">{t('cta.title')}</h2>
        <p className="text-gray-400 mb-10 max-w-lg mx-auto">{t('cta.desc')}</p>
        <Link href="/contact" className="inline-block px-8 py-4 text-base font-bold text-black bg-white hover:bg-gray-100 rounded-full transition shadow-lg shadow-white/10">
          {t('cta.button')}
        </Link>
      </section>

      <Footer />
    </div>
  );
}

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