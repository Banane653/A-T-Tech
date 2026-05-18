"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Plan = "monthly" | "annually";

type PLAN = {
    id: string;
    title: string;
    desc: string;
    monthlyPrice: number;
    annuallyPrice: number;
    badge?: string;
    buttonText: string;
    features: string[];
    link: string;
};

export const PLANS: PLAN[] = [
  {
    id: "starter",
    title: "Starter",
    desc: "L'offre idéale pour lancer son programme de fidélité numérique rapidement et sans effort.",
    monthlyPrice: 10,
    annuallyPrice: 100, // 2 mois offerts !
    badge: "Recommandée",
    buttonText: "Commencer l'essai gratuit",
    features: [
      "Jusqu'à 5 000 cartes actives",
      "Jusqu'à 5 comptes employés",
      "Apple Wallet & Google Pay",
      "Statistiques de base",
      "Outil de scan web inclus",
      "Support par email"
    ],
    link: "/register"
  },
  {
    id: "team",
    title: "Team",
    desc: "Conçu pour les commerces avec un grand volume de clients ou les petites franchises.",
    monthlyPrice: 40,
    annuallyPrice: 400,
    buttonText: "Passer à l'offre Team",
    features: [
      "Cartes actives illimitées",
      "Comptes employés illimités",
      "Statistiques avancées en temps réel",
      "Marque blanche (Sans logo A-T-Tech)",
      "Accès API personnalisé",
      "Support prioritaire 7j/7"
    ],
    link: "/register"
  },
];

export default function PricingSection() {
    const [billPlan, setBillPlan] = useState<Plan>("monthly");

    const handleSwitch = () => {
        setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
    };

    return (
        <div className="relative flex flex-col items-center justify-center max-w-5xl py-24 mx-auto px-6">
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6">
                            Des tarifs simples et clairs.
                        </h2>
                        <p className="text-base md:text-lg text-center text-gray-500 mt-6 max-w-lg">
                            Une fidélité qui se rembourse dès le premier mois. Choisissez l'offre qui correspond à la taille de votre commerce.
                        </p>
                    </div>
                    
                    {/* Switch Toggle (Mensuel / Annuel) */}
                    <div className="flex items-center justify-center space-x-4 mt-10">
                        <span className={cn("text-base font-medium transition-colors", billPlan === "monthly" ? "text-black" : "text-gray-400")}>Mensuel</span>
                        <button onClick={handleSwitch} className="relative rounded-full focus:outline-none">
                            <div className="w-12 h-6 transition rounded-full shadow-inner outline-none bg-black"></div>
                            <div
                                className={cn(
                                    "absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white shadow-sm",
                                    billPlan === "annually" ? "translate-x-6" : "translate-x-0"
                                )}
                            />
                        </button>
                        <span className={cn("text-base font-medium transition-colors", billPlan === "annually" ? "text-black" : "text-gray-400")}>Annuel <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1">2 mois offerts</span></span>
                    </div>
            </div>

            <div className="grid w-full grid-cols-1 lg:grid-cols-2 pt-12 gap-6 max-w-4xl mx-auto">
                {PLANS.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} billPlan={billPlan} />
                ))}
            </div>
        </div>
    );
};

const PlanCard = ({ plan, billPlan }: { plan: PLAN, billPlan: Plan }) => {
    const isHighlighted = plan.badge === "Recommandée";

    return (
        <div className={cn(
            "flex flex-col relative rounded-3xl transition-all bg-white items-start w-full border overflow-hidden",
            isHighlighted ? "border-black shadow-xl shadow-black/5 transform md:-translate-y-2" : "border-gray-200"
        )}>
            {/* Effet lumineux (Glow) sur la carte recommandée */}
            {isHighlighted && (
                <div className="absolute top-1/2 inset-x-0 mx-auto h-12 w-full bg-gray-200 rounded-3xl blur-[5rem] -z-10"></div>
            )}

            {isHighlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-4 py-1 rounded-b-xl uppercase tracking-widest z-10">
                    {plan.badge}
                </div>
            )}

            <div className="p-8 flex flex-col items-start w-full relative">
                <h2 className="font-bold text-2xl text-gray-900 pt-3">
                    {plan.title}
                </h2>
                <h3 className="mt-3 text-4xl font-black md:text-5xl text-black tracking-tight">
                    <NumberFlow
                        value={billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice}
                        suffix={billPlan === "monthly" ? "€/mois" : "€/an"}
                        format={{
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }}
                    />
                </h3>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed min-h-[40px]">
                    {plan.desc}
                </p>
            </div>
            
            <div className="flex flex-col items-start w-full px-8 pb-4">
                <Button variant={isHighlighted ? "default" : "outline"} size="lg" className="w-full text-base font-bold">
                    {plan.buttonText}
                </Button>
                
                <div className="h-8 overflow-hidden w-full mx-auto mt-2">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={billPlan}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="text-xs text-center text-gray-400 mx-auto block"
                        >
                            {billPlan === "monthly" ? (
                                "Facturé mensuellement. Sans engagement."
                            ) : (
                                "Facturé en un seul paiement annuel."
                            )}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col items-start w-full px-8 pb-8 pt-4 bg-gray-50/50 flex-1 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900 mb-4">
                    Ce qui est inclus : 
                </span>
                <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start justify-start gap-3">
                            <div className="flex items-center justify-center mt-0.5 text-black">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm text-gray-600 leading-snug">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};