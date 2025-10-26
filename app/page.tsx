"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
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

    const data = await res.json();
    setResultado(data.resultado || "Erro ao obter resultado.");
    setLoading(false);
  }

  const whatsapp = `https://wa.me/5511970561448?text=${encodeURIComponent(
    "Olá! Quero ajuda com IA no meu negócio!"
  )}`;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-white space-y-8 mt-8 mb-20">
        
        {/* Título */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-green-500">
            Entenda como a IA pode acelerar seu crescimento 🚀
          </h1>
          <p className="text-gray-300 text-sm mt-3">
            Conte seu desafio e receba uma análise estratégica feita por IA para aumentar
            eficiência e resultados do seu negócio.
          </p>
        </div>

        {/* Input */}
        <textarea
          className="w-full h-28 p-4 rounded-lg bg-zinc-900 border border-zinc-700
                     focus:border-green-500 outline-none transition"
          placeholder="Ex.: Quero automatizar atendimento para aumentar vendas"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        {/* Botão */}
        <button
          onClick={gerarDiagnostico}
          disabled={loading}
          className="w-full py-4 rounded-lg bg-green-500 hover:bg-green-600 text-black 
                     font-semibold transition disabled:opacity-40"
        >
          {loading ? "Gerando análise..." : "Gerar diagnóstico com IA"}
        </button>

        {/* Loading animado */}
        {loading && (
          <motion.div
            className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Resultado estilizado */}
        {resultado && (
          <motion.div
            className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 text-sm 
                       leading-relaxed space-y-4 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="whitespace-pre-line text-gray-200">
              {resultado}
            </div>

            {/* CTA final */}
            <a
              href={whatsapp}
              target="_blank"
              className="block text-center w-full py-3 rounded-lg border border-green-500 
                         text-green-400 font-semibold hover:bg-green-600 hover:text-black transition"
            >
              Conversar com especialista ⚡️
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}
