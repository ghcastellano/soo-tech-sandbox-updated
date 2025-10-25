import "./globals.css";

export const metadata = {
  title: "Soo Tech | Diagnóstico IA Disruptivo",
  description: "Criação de produtos com IA que transformam negócios.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
