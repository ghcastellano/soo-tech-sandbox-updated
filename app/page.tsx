"use client";

import { useState } from "react";
import "./globals.css";

export default function Home() {
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  async function gerar() {
    if (!descricao.trim()) return;
    setLoading(true);
    setResultado("");

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      body: JSON.stringify({ descricao }),
      headers: { "Content-Type": "application/json" }
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setResultado(prev => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center justify-center px-4 py-10 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold">
        Diagnóstico Inteligente <span className="text-brand-500">Soo Tech</span>
      </h1>

      <p className="text-neutral-400 mt-3 mb-8">
        Entenda como a IA pode acelerar seus resultados.
      </p>

      <textarea
        placeholder="Descreva seu desafio..."
        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 focus:ring-2 focus:ring-brand-500 outline-none min-h-[140px]"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <button
        onClick={gerar}
        disabled={loading}
        className="mt-6 bg-brand-500 w-full py-4 rounded-xl font-semibold text-black hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Gerando análise…" : "Gerar Diagnóstico IA"}
      </button>

      {loading && (
        <p className="mt-4 animate-pulse text-brand-500">
          ▲ Analisando seu caso…
        </p>
      )}

      {resultado && (
        <pre className="bg-neutral-900/70 p-6 mt-8 rounded-xl border border-neutral-800 text-left whitespace-pre-wrap">
          {resultado}
        </pre>
      )}

      <footer className="text-xs text-neutral-600 mt-10">
        Powered by Soo Tech AI ⚡
      </footer>
    </main>
  );
}
