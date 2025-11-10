"use client";

import { useTranslations } from "next-intl";

import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { authClient } from "@/lib/auth-client";

export function DangerZone() {
  const t = useTranslations("settings.profile.dangerZone");

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-destructive">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-destructive">{t("deleteAccount")}</p>
          <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
        </div>
        <BetterAuthActionButton
          action={() => {
            return authClient.deleteUser({
              callbackURL: "/",
            });
          }}
          requireAreYouSure
          variant="destructive"
          successMessage={t("deleteSuccess")}
        >
          {t("deleteAccount")}
        </BetterAuthActionButton>
      </div>
    </section>
  );
}
