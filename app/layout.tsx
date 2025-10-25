import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnóstico Inteligente Soo Tech",
  description: "Avaliação consultiva personalizada para acelerar resultados com IA."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="bg-black">
      <body className="antialiased">{children}</body>
    </html>
  );
}
