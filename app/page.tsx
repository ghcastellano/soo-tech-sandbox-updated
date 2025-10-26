"use client";
import { useState } from "react";

export default function Home() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);

  async function gerar() {
    if (!descricao.trim()) return;

    setLoading(true);
    setResultado("");

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
      });

      const data = await res.json();
      setResultado(data.resultado || "Não foi possível gerar o diagnóstico.");
    } catch {
      setResultado("Erro ao consultar análise.");
    }

    setLoading(false);
  }

  const whatsapp = `https://wa.me/5511970561448?text=${encodeURIComponent(
    "Olá! Quero ajuda com IA no meu negócio."
  )}`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-xl w-full space-y-6 text-center">
        {/* Header curto estratégico */}
        <h1 className="text-2xl font-bold text-green-400">
          Entenda como a IA pode acelerar seu crescimento 🚀
        </h1>
        <p className="text-gray-300 text-sm">
          Conte seu desafio e receba uma análise estratégica feita por IA para aumentar
          eficiência e resultados do seu negócio.
        </p>

        {/* Input */}
        <textarea
          className="w-full h-28 p-3 rounded-md bg-zinc-900 border border-zinc-700 text-sm"
          placeholder="Ex.: Quero automatizar atendimento para aumentar vendas"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        {/* Ações */}
        <button
          onClick={gerar}
          disabled={loading}
          className="w-full py-3 rounded-md bg-green-500 hover:bg-green-600 
                     text-black font-semibold transition disabled:opacity-40"
        >
          {loading ? "Gerando análise..." : "Gerar diagnóstico com IA"}
        </button>

        {/* Resultado */}
        {resultado && (
          <div className="bg-zinc-900 p-4 rounded-md text-sm text-left whitespace-pre-line border border-zinc-700">
            {resultado}
          </div>
        )}

        {/* CTA Consultor */}
        {resultado && (
          <a
            href={whatsapp}
            target="_blank"
            className="block w-full py-3 rounded-md border border-green-500 text-green-400 hover:bg-green-600 hover:text-black transition font-medium"
          >
            Conversar com especialista ⚡️
          </a>
        )}
      </div>
    </main>
  );
}
