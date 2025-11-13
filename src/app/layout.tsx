import { headers } from "next/headers";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const isDocsOrLegal = pathname.startsWith("/docs") || pathname.startsWith("/legal");
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>{isDocsOrLegal ? children : children}</body>
    </html>
  );
}
