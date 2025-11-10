"use client";

import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";

export function SecurityHeader() {
  const t = useTranslations("settings.security");

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Separator />
    </>
  );
}
