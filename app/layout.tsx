import "./globals.css";

export const metadata = {
  title: "Soo Tech | Diagnóstico IA Disruptivo",
  description: "Componente de diagnóstico inteligente para produtos com IA, dados e analytics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="bg-dark text-white antialiased">{children}</body>
    </html>
  );
}
