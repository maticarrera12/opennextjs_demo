"use client";

import { Plus, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import BetterAuthActionButton from "@/app/[locale]/(auth)/_components/better-auth-action-button";
import { authClient } from "@/lib/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS_DETAILS,
  type SupportedOAuthProviders,
} from "@/lib/o-auth-providers";

type LinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string;
};

export function AccountLinking({ currentAccounts }: { currentAccounts: LinkedAccount[] }) {
  const t = useTranslations("settings.profile.linkedAccounts");

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      {currentAccounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground/80">
          {t("noAccounts")}
        </div>
      ) : (
        <div className="space-y-3">
          {currentAccounts.map((account) => (
            <AccountCard key={account.id} provider={account.providerId} account={account} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium">{t("linkOther")}</h3>
        <div className="grid gap-3">
          {SUPPORTED_OAUTH_PROVIDERS.filter(
            (provider) => !currentAccounts.find((acc) => acc.providerId === provider)
          ).map((provider) => (
            <AccountCard key={provider} provider={provider as SupportedOAuthProviders} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AccountCard({
  provider,
  account,
}: {
  provider: SupportedOAuthProviders | string;
  account?: LinkedAccount;
}) {
  const router = useRouter();
  const t = useTranslations("settings.profile.linkedAccounts");

  const providerDetails = SUPPORTED_OAUTH_PROVIDERS_DETAILS[
    provider as SupportedOAuthProviders
  ] ?? {
    name: provider,
    Icon: Shield,
  };

  function linkAccount() {
    return authClient.linkSocial({
      provider,
      callbackURL: "/app/settings/account/profile",
    });
  }

  function unlinkAccount() {
    if (account == null) {
      return Promise.resolve({ error: { message: "Account not found" } });
    }
    return authClient.unlinkAccount(
      {
        accountId: account.accountId,
        providerId: provider,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center space-x-3">
        {<providerDetails.Icon className="size-5" />}
        <div>
          <p className="font-medium">{providerDetails.name}</p>
          {account == null ? (
            <p className="text-sm text-muted-foreground">
              {t("connectAccount", { provider: providerDetails.name })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("linkedOn")} {new Date(account.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {account == null ? (
        <BetterAuthActionButton variant="outline" size="sm" action={linkAccount}>
          <Plus />
          {t("link")}
        </BetterAuthActionButton>
      ) : (
        <BetterAuthActionButton variant="destructive" size="sm" action={unlinkAccount}>
          <Trash2 />
          {t("unlink")}
        </BetterAuthActionButton>
      )}
    </div>
  );
}
