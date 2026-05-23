"use client";

import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type Plan = "monthly" | "annually";

// On ne garde que la logique "technique" dans le tableau, les textes vont dans le JSON
type PLAN = {
    id: string;
    monthlyPrice: number;
    annuallyPrice: number;
    link: string;
};

export const PLANS: PLAN[] = [
  {
    id: "pro",
    monthlyPrice: 10,
    annuallyPrice: 100,
    link: "/register"
  }
];

export default function PricingSection() {
    const t = useTranslations('Pricing');
    const [billPlan, setBillPlan] = useState<Plan>("monthly");

    const handleSwitch = () => {
        setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
    };

    return (
        <div className="relative flex flex-col items-center justify-center max-w-5xl py-24 mx-auto px-6">
            <div className="flex flex-col items-center justify-center w-full mx-auto">
                    
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6">
                            {t('title')}
                        </h2>
                        <p className="text-base md:text-lg text-center text-gray-500 mt-6 max-w-lg">
                            {t('description')}
                        </p>
                    </div>
                    
                    {/* Switch Toggle (Mensuel / Annuel) */}
                    <div className="flex items-center justify-center space-x-4 mt-10">
                        <span className={cn("text-base font-medium transition-colors", billPlan === "monthly" ? "text-black" : "text-gray-400")}>
                            {t('toggle.monthly')}
                        </span>
                        <button onClick={handleSwitch} className="relative rounded-full focus:outline-none">
                            <div className="w-12 h-6 transition rounded-full shadow-inner outline-none bg-black"></div>
                            <div
                                className={cn(
                                    "absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white shadow-sm",
                                    billPlan === "annually" ? "translate-x-6" : "translate-x-0"
                                )}
                            />
                        </button>
                        <span className={cn("text-base font-medium transition-colors", billPlan === "annually" ? "text-black" : "text-gray-400")}>
                            {t('toggle.annually')} 
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1">
                                {t('toggle.discount')}
                            </span>
                        </span>
                    </div>
            </div>

            <div className="w-full flex justify-center pt-12">
                <div className="w-full max-w-md">
                    {PLANS.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} billPlan={billPlan} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const PlanCard = ({ plan, billPlan }: { plan: PLAN, billPlan: Plan }) => {
    // On appelle aussi les traductions dans le composant enfant
    const t = useTranslations('Pricing');
    
    // On boucle sur nos 6 fonctionnalités traduites (de 0 à 5)
    const features = [0, 1, 2, 3, 4, 5].map((index) => t(`plan.features.${index}`));

    return (
        <div className="flex flex-col relative rounded-3xl transition-all bg-white items-start w-full border border-black shadow-2xl shadow-black/10 overflow-hidden transform hover:-translate-y-1 duration-300">
            
            <div className="absolute top-1/2 inset-x-0 mx-auto h-12 w-full bg-gray-200 rounded-3xl blur-[5rem] -z-10"></div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-4 py-1 rounded-b-xl uppercase tracking-widest z-10">
                {t('plan.badge')}
            </div>

            <div className="p-8 flex flex-col items-center text-center w-full relative">
                <h2 className="font-bold text-2xl text-gray-900 pt-3">
                    {t('plan.title')}
                </h2>
                <h3 className="mt-4 text-5xl font-black text-black tracking-tight flex items-center justify-center">
                    <NumberFlow
                        value={billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice}
                        suffix={billPlan === "monthly" ? t('pricing.monthSuffix') : t('pricing.yearSuffix')}
                        format={{
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }}
                    />
                </h3>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                    {t('plan.desc')}
                </p>
            </div>
            
            <div className="flex flex-col items-center w-full px-8 pb-4">
                <Button variant="default" size="lg" className="w-full text-base font-bold bg-black text-white hover:bg-gray-800 py-6 rounded-xl">
                    {t('plan.button')}
                </Button>
                
                <div className="h-8 overflow-hidden w-full mx-auto mt-3">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={billPlan}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="text-xs text-center text-gray-400 mx-auto block"
                        >
                            {billPlan === "monthly" ? t('billing.monthly') : t('billing.annually')}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col items-start w-full px-8 pb-8 pt-6 bg-gray-50/50 flex-1 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase">
                    {t('included')}
                </span>
                <div className="space-y-4 w-full">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center justify-start gap-3">
                            <div className="flex items-center justify-center text-black bg-white rounded-full p-1 shadow-sm border border-gray-100">
                                <CheckIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};