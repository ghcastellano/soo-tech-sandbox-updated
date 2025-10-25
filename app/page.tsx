"use client";
import { useState } from "react";
import DiagnosticoInteligente from "@/components/DiagnosticoInteligente";

export default function Home() {
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  async function gerar() {
    if (!descricao.trim()) return;
    setLoading(true);
    setResultado("");

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        body: JSON.stringify({ descricao }),
        headers: { "Content-Type": "application/json" }
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResultado(prev => prev + decoder.decode(value));
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0E1117] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold">
          Diagnóstico Inteligente Soo Tech com IA
        </h1>
        <p className="text-gray-300 mt-4 text-lg">
          Avaliação consultiva personalizada para acelerar seus resultados usando IA.
        </p>
      </div>

      <div className="bg-[#1A1F26] max-w-4xl w-full p-8 rounded-2xl shadow-xl">
        <textarea
          className="w-full h-40 p-4 rounded-lg bg-[#111418] text-white outline-none border border-gray-700 focus:border-green-500 transition-all"
          placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar o UX..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <button
          onClick={gerar}
          disabled={loading}
          className="mt-6 w-full py-4 rounded-xl text-xl font-semibold bg-green-500 text-black 
                     hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-400 transition-all"
        >
          {loading ? "Gerando Diagnóstico…" : "Gerar Diagnóstico IA"}
        </button>

        {loading && (
          <p className="text-center mt-4 text-green-400 animate-pulse">
            📡 Analisando sua oportunidade…
          </p>
        )}

        {resultado && (
          <div className="mt-8 bg-black/20 p-6 rounded-lg border border-gray-700 text-left whitespace-pre-wrap">
            {resultado}
          </div>
        )}
      </div>

      <div className="text-gray-500 text-xs mt-6">
        Powered by Soo Tech AI ⚡
      </div>
    </main>
  );
}
