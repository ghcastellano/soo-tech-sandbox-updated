"use client";

import { DiagnosticoInteligente, NeuralBackground } from "@/components";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black">
      <NeuralBackground />
      <div className="relative z-10 w-full max-w-3xl px-6 py-16">
        <DiagnosticoInteligente />
      </div>
    </main>
  );
}
