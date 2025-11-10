"use client";

import { useTranslations } from "next-intl";

interface PlanSectionProps {
  plan: string;
}

export function PlanSection({ plan }: PlanSectionProps) {
  const t = useTranslations("settings.profile.subscriptionPlan");

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="space-y-2">
        <p className="font-medium">
          {t("currentPlan")}: {plan}
        </p>
        <p className="text-sm text-muted-foreground">
          {plan === "FREE" ? t("freeTier") : `${plan} ${t("paidTier")}`}
        </p>
      </div>
    </section>
  );
}
