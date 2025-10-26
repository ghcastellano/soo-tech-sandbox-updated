"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function gerarDiagnostico() {
    setLoading(true);
    setResultado(null);

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao }),
      });

      const data = await res.json();
      setResultado(data.content);
    } catch {
      setResultado(
        "Não consegui gerar agora, pode tentar novamente? ⚡️ Obrigado!"
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-10 px-4 text-gray-100 bg-black">
      <div className="w-full max-w-4xl bg-neutral-900/60 border border-neutral-800 p-8 rounded-3xl shadow-xl backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-3 text-center text-white">
          Entenda como a IA pode acelerar seu crescimento 🚀
        </h2>
        <p className="text-center text-neutral-300 mb-8">
          Conte seu desafio e receba uma análise estratégica feita por IA para
          acelerar seus resultados.
        </p>

        <textarea
          className="w-full h-32 bg-black/50 border border-neutral-700 rounded-xl p-4 text-neutral-200 focus:outline-none"
          placeholder="Descreva seu desafio de negócio..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <button
          onClick={gerarDiagnostico}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-black transition shadow-md"
        >
          {loading ? "Gerando Diagnóstico..." : "Gerar Diagnóstico com IA 🚀"}
        </button>

        <div className="mt-10">
          {loading && (
            <motion.div
              className="text-center text-emerald-400 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              Processando insights estratégicos com IA... 🤖⚡️
            </motion.div>
          )}

          {resultado && (
            <motion.div
              className="mt-6 p-6 bg-black/40 border border-neutral-700 rounded-xl whitespace-pre-wrap leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: converterMarkdown(resultado) }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

// Markdown básico -> HTML (negrito, títulos, listas)
function converterMarkdown(md: string) {
  return md
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\d+\) (.*$)/gm, "<strong>$1</strong>")
    .replace(/- (.*$)/gm, "• $1")
    .replace(/\n/g, "<br/>");
}
