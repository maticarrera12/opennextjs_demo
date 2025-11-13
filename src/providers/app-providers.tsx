"use client";

import { NextIntlClientProvider } from "next-intl";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { useSession } from "@/lib/auth-client";
export function AppProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  const { data: session } = useSession();
  const userTheme = (session?.user as { theme?: string } | undefined)?.theme ?? "system";

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme={userTheme} enableSystem>
          {children}
        </ThemeProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
