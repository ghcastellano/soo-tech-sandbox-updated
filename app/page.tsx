"use client";
import { useState } from "react";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });

      const data = await res.json();
      setResult(data.result ?? "Erro ao gerar o diagnóstico.");
    } catch {
      setResult("Erro ao conectar com a IA.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-neutral-900 to-black text-white flex flex-col items-center justify-start p-6 pt-20 relative">
      
      {/* Fundo neural cadenciado */}
      <div className="absolute inset-0 pointer-events-none animate-pulse opacity-20 bg-[radial-gradient(circle_at_30%_30%,#00e39433,transparent_50%),radial-gradient(circle_at_70%_70%,#008ae633,transparent_50%)]" />

      {/* Hero */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mt-6">
        Diagnóstico Inteligente{" "}
        <span className="text-emerald-400 drop-shadow-[0_0_10px_#00ffbb]">
          Soo Tech
        </span>
      </h1>
      <p className="text-neutral-300 text-center text-lg mt-3 max-w-2xl">
        Avaliação consultiva personalizada para acelerar seus resultados usando IA.
      </p>

      {/* Card de input */}
      <div className="mt-12 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl w-full max-w-4xl p-8 shadow-xl shadow-black/40">
        <label className="block text-xl font-medium text-neutral-200 mb-4">
          Descreva seu desafio de negócios
        </label>
        <textarea
          className="w-full h-36 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-700 text-neutral-100 text-lg
          placeholder-neutral-600 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none resize-none"
          placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar UX..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={generate}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl font-semibold text-lg transition-all
          bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97]
          shadow-[0_0_20px_#00ffbb88] hover:shadow-[0_0_30px_#00ffbbcc] disabled:opacity-50"
        >
          {loading ? "Gerando diagnóstico..." : "Gerar Diagnóstico IA"}
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="w-full max-w-4xl bg-neutral-900/50 mt-10 p-8 rounded-3xl border border-neutral-800 whitespace-pre-wrap leading-relaxed text-neutral-200 shadow-lg shadow-black/40">
          {result}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 opacity-60 hover:opacity-100 transition text-sm">
        Powered by <span className="text-emerald-400">Soo Tech AI ⚡</span>
      </footer>
    </div>
  );
}
