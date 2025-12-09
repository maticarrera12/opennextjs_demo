import "../globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ViewTransitions } from "next-view-transitions";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { AppProviders } from "../../../app-providers";
import { StopImpersonatingBanner } from "@/components/ui/stop-impersonation";
import { routing } from "@/i18n/routing";
import { loadMessages } from "@/lib/load-messages";
import MessagesProvider from "@/providers/message-provider";

// Pre-generate all locale routes for static rendering
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

async function LocaleContent({ children, locale }: { children: React.ReactNode; locale: string }) {
  const messages = await loadMessages(locale);

  return (
    <MessagesProvider locale={locale} messages={messages}>
      <AppProviders>
        {children}
        <StopImpersonatingBanner />
        <Toaster position="top-right" richColors />
        <Analytics />
        <SpeedInsights />
      </AppProviders>
    </MessagesProvider>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ViewTransitions>
      <html lang={locale}>
        <body>
          <Suspense fallback={null}>
            <LocaleContent locale={locale}>{children}</LocaleContent>
          </Suspense>
        </body>
      </html>
    </ViewTransitions>
  );
}
