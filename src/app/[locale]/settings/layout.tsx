import { headers } from "next/headers";
import type { ReactNode } from "react";

import SettingsSidebar from "./_components/settings-sidebar";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect({ href: "/signin", locale: params.locale });
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SettingsSidebar />
      <main className="flex-1 overflow-y-auto border-t border-border bg-background pt-14 md:pt-0">
        <div className="mx-auto max-w-3xl p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
