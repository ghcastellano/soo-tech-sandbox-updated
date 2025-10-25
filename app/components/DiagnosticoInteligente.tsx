"use client";

import { useState } from "react";

export default function DiagnosticoInteligente() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);

  async function gerarDiagnostico() {
    if (!descricao.trim()) return;

    setLoading(true);
    setResultado("");

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      setResultado((prev) => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  return (
    <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-white/10">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Diagnóstico Inteligente IA
      </h1>
      <p className="text-gray-300 text-center mb-6">
        Conte seu desafio e receba uma avaliação estratégica sob medida para sua empresa.
      </p>

      <textarea
        className="w-full min-h-[120px] rounded-xl p-4 bg-gray-900/50 text-white placeholder-gray-400 border border-white/10 focus:ring-green-400 focus:border-green-400 transition"
        placeholder="Ex: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX…"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <button
        onClick={gerarDiagnostico}
        disabled={loading}
        className={`w-full mt-6 py-4 rounded-xl font-semibold transition 
        ${
          loading
            ? "bg-green-600/20 text-green-300 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600 text-black"
        }`}
      >
        {loading ? "Gerando Análise..." : "Gerar Diagnóstico IA"}
      </button>

      {loading && (
        <div className="mt-6 text-center text-green-400 animate-pulse">
          🔄 Criando sua avaliação estratégica…
        </div>
      )}

      {resultado && (
        <div className="mt-8 bg-black/30 rounded-xl p-4 text-white border border-white/10 whitespace-pre-line">
          {resultado}
        </div>
      )}
    </div>
  );
}
