// Caminho: /app/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soo Tech AI Blueprint",
  description: "Gerador de Blueprint de Soluções de IA ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
