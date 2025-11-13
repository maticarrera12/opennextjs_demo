"use client";

import { QueryProvider } from "./src/providers/query-provider";
import { ThemeProvider } from "./src/providers/theme-provider";
import { useSession } from "@/lib/auth-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userTheme = (session?.user as { theme?: string } | undefined)?.theme ?? "system";

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme={userTheme} enableSystem>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
