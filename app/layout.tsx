import "./globals.css";

export const metadata = {
  title: "Soo Tech – Diagnóstico Inteligente",
  description: "Consultoria Tech impulsionada por IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
