import { headers } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const isDocsOrLegal = pathname.startsWith("/docs") || pathname.startsWith("/legal");

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{isDocsOrLegal ? children : children}</body>
    </html>
  );
}
