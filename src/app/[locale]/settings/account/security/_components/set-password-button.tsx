"use client";
import { useTranslations } from "next-intl";

import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { authClient } from "@/lib/auth-client";

export function SetPasswordButton({ email }: { email: string }) {
  const t = useTranslations("settings.security.setPassword");

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>
      <BetterAuthActionButton
        action={async () => {
          const result = await authClient.requestPasswordReset({
            email,
            redirectTo: "/reset-password",
          });
          return { error: result.error };
        }}
        successMessage={t("emailSent")}
        variant="outline"
      >
        {t("sendEmail")}
      </BetterAuthActionButton>
    </section>
  );
}
