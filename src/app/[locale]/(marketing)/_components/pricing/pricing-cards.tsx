"use client";

import { motion } from "framer-motion";
import { Tick01Icon, StarIcon, ArrowRight01Icon } from "hugeicons-react";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";

import { PaymentMethodSelector } from "./payment-method-selector";
import { PricingSkeleton } from "./pricing-skeleton";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { authClient } from "@/lib/auth-client";
import { PLANS, CREDIT_PACKS } from "@/lib/credits/constants";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: (typeof PLANS)[keyof typeof PLANS];
  interval: "monthly" | "annual";
  isPopular: boolean;
  t: ReturnType<typeof useTranslations>;
  onChoosePlan: () => void;
  currentUserPlan: string | null;
}

interface CreditPackCardProps {
  pack: (typeof CREDIT_PACKS)[keyof typeof CREDIT_PACKS];
  t: ReturnType<typeof useTranslations>;
  onBuyCredits: () => void;
}

export function PricingCards() {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const { push } = useLocaleRouting();
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    type: "subscription" | "credit_pack";
    id: string;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: session, isPending } = authClient.useSession();
  const userPlan = (session?.user as { plan?: string })?.plan || null;

  if (!mounted || isPending) {
    return <PricingSkeleton />;
  }

  const activePlans = Object.entries(PLANS).filter(([key, plan]) => {
    if (key === "FREE") return true;
    return plan.stripe[interval] || plan.lemonSqueezy[interval];
  });

  const handleChoosePlan = (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    if (plan.id === "free") {
      push("/signin");
      return;
    }

    if (!session?.user) {
      push("/signin");
      return;
    }

    setSelectedPlan({ type: "subscription", id: plan.id });
    setIsModalOpen(true);
  };

  const handleBuyCredits = (packKey: string) => {
    if (!session?.user) {
      push("/signin");
      return;
    }
    const pack = CREDIT_PACKS[packKey as keyof typeof CREDIT_PACKS];
    setSelectedPlan({ type: "credit_pack", id: pack.id });
    setIsModalOpen(true);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) return;
    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedPlan.type,
          locale,
          ...(selectedPlan.type === "subscription"
            ? { planId: selectedPlan.id, interval }
            : { packId: selectedPlan.id }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || data.error === "Unauthorized") {
          window.location.href = `/${locale}/signin`;
          return;
        }
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create checkout session";
      alert(`❌ Error: ${errorMessage}`);
      setIsModalOpen(false);
    }
  };

  const handleLemonCheckout = () => {
    alert("Lemon Squeezy coming soon!");
  };

  return (
    <div id="pricing" className="w-full py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground">
            {t("title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>

          <div className="flex justify-center my-8">
            <div className="relative bg-muted/50 p-1.5 rounded-full inline-flex items-center shadow-inner border border-black/5 dark:border-white/5">
              <button
                onClick={() => setInterval("monthly")}
                className={cn(
                  "relative px-8 py-2.5 rounded-full text-sm font-semibold transition-colors z-10",
                  interval === "monthly"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {interval === "monthly" && (
                  <motion.div
                    layoutId="pricing-toggle"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-black/5 dark:border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{t("interval.monthly")}</span>
              </button>

              <button
                onClick={() => setInterval("annual")}
                className={cn(
                  "relative px-8 py-2.5 rounded-full text-sm font-semibold transition-colors z-10 flex items-center gap-2",
                  interval === "annual"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {interval === "annual" && (
                  <motion.div
                    layoutId="pricing-toggle"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-black/5 dark:border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {t("interval.annual")}
                  <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                    {t("interval.savePercent")}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
          {activePlans.map(([key, plan]) => (
            <PlanCard
              key={key}
              plan={plan}
              interval={interval}
              isPopular={key === "PRO"}
              t={t}
              onChoosePlan={() => handleChoosePlan(key)}
              currentUserPlan={userPlan}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PaymentMethodSelector
          onSelectStripe={handleStripeCheckout}
          onSelectLemon={handleLemonCheckout}
        />
      </Modal>
    </div>
  );
}

function PlanCard({ plan, interval, isPopular, t, onChoosePlan, currentUserPlan }: PlanCardProps) {
  const price =
    interval === "monthly"
      ? plan.price.monthly
      : "annual" in plan.price
        ? plan.price.annual
        : plan.price.monthly;
  const pricePerMonth =
    interval === "annual" && "annual" in plan.price ? Math.round(plan.price.annual / 12) : price;

  const isCurrentPlan = currentUserPlan?.toUpperCase() === plan.id.toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col p-8 md:p-10 rounded-[2.5rem] border transition-all duration-300 bg-white dark:bg-white/5",
        isPopular
          ? "border-primary shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] shadow-primary/10 z-10"
          : "border-border/60 shadow-sm hover:shadow-xl hover:border-border"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/25 flex items-center gap-1">
          <StarIcon className="w-3 h-3 fill-current" />
          Most Popular
        </div>
      )}

      <div className="mb-8 space-y-4">
        <h3 className="text-2xl font-bold text-foreground tracking-tight">{plan.name}</h3>
        {"description" in plan && plan.description && (
          <p className="text-muted-foreground text-sm leading-relaxed h-10">{plan.description}</p>
        )}

        <div className="flex items-baseline gap-1 pt-2">
          <span className="text-5xl md:text-6xl font-bold text-foreground tracking-tighter">
            ${pricePerMonth}
          </span>
          <span className="text-muted-foreground font-medium ml-1">/{t("perMonth")}</span>
        </div>

        {interval === "annual" && (
          <p className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 py-1 px-2 rounded-md inline-block">
            {t("billedAnnually", { price: `$${price}` })}
          </p>
        )}
      </div>

      <Button
        onClick={onChoosePlan}
        disabled={isCurrentPlan}
        className={cn(
          "w-full h-14 rounded-full font-bold text-base tracking-wide transition-all shadow-lg",
          isCurrentPlan
            ? "bg-muted text-muted-foreground shadow-none border border-border cursor-not-allowed"
            : isPopular
              ? "bg-primary text-white hover:bg-primary/90 shadow-primary/25 hover:scale-[1.02]"
              : "bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02]"
        )}
      >
        {isCurrentPlan
          ? t("buttons.currentPlan")
          : plan.id === "free"
            ? t("buttons.getStarted")
            : t("buttons.choosePlan")}
        {!isCurrentPlan && <ArrowRight01Icon className="ml-2 w-5 h-5" />}
      </Button>

      <div className="mt-10 flex-grow">
        {"featuresHeading" in plan && plan.featuresHeading && (
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 opacity-80">
            {plan.featuresHeading}
          </p>
        )}

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
              <Tick01Icon className="w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span className="text-sm text-foreground/80 font-medium leading-tight">
              <strong className="text-foreground">{plan.credits.monthly}</strong>{" "}
              {t("plans.free.features.credits")}
              {plan.credits.rollover && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  ({t("plans.free.features.rollover")})
                </span>
              )}
            </span>
          </li>

          {plan.features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                <Tick01Icon className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
              <span className="text-sm text-foreground/80 leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function CreditPackCard({ pack, t, onBuyCredits }: CreditPackCardProps) {
  return (
    <div className="relative flex flex-col p-8 rounded-[2rem] bg-muted/30 border border-border hover:border-primary/50 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 group">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground">{pack.name}</h3>
          {pack.savings > 0 && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
              -{pack.savings}%
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tighter">${pack.price}</span>
          <span className="text-sm text-muted-foreground">
            / {t("creditPacks.features.oneTimePayment")}
          </span>
        </div>
        <p className="mt-2 text-primary font-semibold">
          {pack.credits} {t("creditPacks.credits")}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        <li className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tick01Icon className="w-4 h-4 text-primary" /> {t("creditPacks.features.noExpiration")}
        </li>
        <li className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tick01Icon className="w-4 h-4 text-primary" /> {t("creditPacks.features.useAnytime")}
        </li>
      </ul>

      <button
        onClick={onBuyCredits}
        className="w-full py-3 rounded-xl font-bold text-sm bg-white border border-border shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
      >
        {t("buttons.buyCredits")}
      </button>
    </div>
  );
}
