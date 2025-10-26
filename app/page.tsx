"use client";
import { useState } from "react";

export default function Diagnostico() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);

  async function gerar() {
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
      const { done, value } = await reader?.read()!;
      if (done) break;
      setResultado((prev) => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-start px-4 py-24">
      
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Diagnóstico Inteligente Soo Tech ⭐⭐⭐⭐⭐
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed">
          Conte seu desafio e receba uma análise estratégica feita por IA para acelerar seus resultados.
        </p>
      </div>

      <div className="w-full max-w-2xl mt-10 space-y-6">
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Tenho uma fintech e quero aumentar a conversão de novos clientes usando IA..."
          className="w-full h-40 p-4 rounded-xl bg-black/40 text-gray-200 border border-gray-700 focus:border-green-500 transition"
        />

        <button
          onClick={gerar}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-black text-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Gerando análise consultiva..." : "Gerar Diagnóstico"}
        </button>

        {loading && (
          <div className="animate-pulse text-green-400 text-center">
            Analisando impacto, benchmark e ROI...
          </div>
        )}

        {resultado && (
          <div className="bg-black/50 border border-gray-700 rounded-xl p-6 text-gray-100 whitespace-pre-wrap mt-4 shadow-lg">
            {resultado}

            <a
              href={`https://wa.me/5511970561448?text=Olá!%20Li%20meu%20Diagnóstico%20IA%20e%20quero%20falar%20com%20um%20especialista`}
              target="_blank"
              className="block text-center mt-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-black transition"
            >
              Conversar com consultor especialista ⚡️
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
