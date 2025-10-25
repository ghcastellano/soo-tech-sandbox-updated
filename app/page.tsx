"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const gerar = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const data = await res.json();
    setLoading(false);
    setResult(data.result ?? "Erro ao gerar resposta.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-20 text-white bg-gradient-to-br from-black via-neutral-900 to-black">
      
      <h1 className="text-center text-4xl md:text-6xl font-bold mb-4">
        Diagnóstico Inteligente{" "}
        <span className="text-emerald-400 drop-shadow-lg">Soo Tech</span>
      </h1>
      
      <p className="text-neutral-300 text-lg text-center max-w-2xl">
        Avaliação consultiva personalizada para acelerar seus resultados usando IA.
      </p>

      {/* Área do card */}
      <div className="mt-12 w-full max-w-4xl bg-neutral-900/60 border border-neutral-700 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <label className="text-xl mb-4 block text-neutral-200">
          Descreva seu desafio de negócio
        </label>

        <textarea
          rows={5}
          className="w-full p-4 rounded-2xl text-lg bg-black/60 border border-neutral-700 focus:ring-2 focus:ring-emerald-400 outline-none"
          placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={gerar}
          disabled={loading}
          className="w-full py-4 mt-6 rounded-2xl text-lg font-semibold bg-emerald-500 hover:bg-emerald-400 
          transition-all active:scale-[0.97] shadow-[0_0_20px_#00ffbb88] disabled:opacity-50"
        >
          {loading ? "Gerando..." : "Gerar Diagnóstico IA 🚀"}
        </button>
      </div>

      {result && (
        <div className="w-full max-w-4xl mt-10 p-8 border border-neutral-700 bg-neutral-900/60 rounded-3xl text-neutral-200 whitespace-pre-wrap leading-relaxed">
          {result}
        </div>
      )}

      <footer className="mt-20 text-neutral-500 text-sm">
        Powered by <span className="text-emerald-400">Soo Tech AI ⚡</span>
      </footer>
    </div>
  );
}
