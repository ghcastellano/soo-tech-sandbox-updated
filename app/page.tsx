"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function gerarDiagnostico() {
    if (!prompt) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Erro:", error);
      setResult(null);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-4xl bg-[#111] p-10 rounded-3xl border border-[#1f1f1f] shadow-lg">

        {/* Sub-texto de orientação */}
        <p className="text-center text-lg text-gray-300 mb-8">
          Conte seu desafio e receba uma análise estratégica criada com IA.
        </p>

        <label className="block text-xl font-medium text-gray-200 mb-3">
          Descreva seu desafio de negócio
        </label>

        <textarea
          className="w-full p-5 rounded-xl bg-black border border-[#2f2f2f] text-lg min-h-[150px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={gerarDiagnostico}
          disabled={loading}
          className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 transition-all text-black font-semibold text-xl p-5 rounded-xl shadow-lg disabled:opacity-50"
        >
          {loading ? "Gerando análise..." : "Gerar Diagnóstico IA 🚀"}
        </button>

        {result && (
          <div className="mt-10 bg-black border border-[#2f2f2f] p-6 rounded-xl text-gray-200 text-lg whitespace-pre-line">
            {result.content}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-10">
          Powered by Soo Tech AI ⚡
        </p>
      </div>
    </main>
  );
}
