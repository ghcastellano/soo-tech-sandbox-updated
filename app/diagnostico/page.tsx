
"use client";

import NeuralBackground from "@/components/NeuralBackground";
import DiagnosticoInteligente from "@/components/DiagnosticoInteligente";

export default function Page() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <NeuralBackground />

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Diagnóstico IA Disruptivo
          </h1>
          <p className="text-white/70 mt-3 text-lg md:text-xl">
            Insights estratégicos acionáveis, com linguagem executiva e foco em impacto de negócio . 
          </p>
        </header>

        <DiagnosticoInteligente />
      </section>
    </main>
  );
}
