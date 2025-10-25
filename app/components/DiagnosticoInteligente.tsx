"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DiagnosticoInteligente() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function gerarDiagnostico() {
    setLoading(true);
    setResultado(null);

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao, idioma: navigator.language }),
    });

    const data = await res.json();

    try {
      const parsed = JSON.parse(data.content);
      setResultado(parsed);
    } catch {
      setResultado(data);
    }

    setLoading(false);
  }

  return (
    <section id="diagnostico" className="max-w-4xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 p-10 rounded-3xl border border-white/20 shadow-xl"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Diagnóstico Inteligente
        </h2>
        <p className="text-white/70 mb-8 text-lg">
          Análise consultiva com insights estratégicos desenvolvidos pela Soo Tech.
        </p>

        {/* Input para o usuário */}
        {!resultado && (
          <>
            <textarea
              className="w-full p-4 bg-white/10 rounded-xl text-white placeholder-white/30 min-h-[120px]"
              placeholder="Conte seu desafio rapidamente. Ex: Sou uma fintech e quero reduzir inadimplência com IA..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <button
              onClick={gerarDiagnostico}
              disabled={loading}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Analisando..." : "Gerar Diagnóstico"}
            </button>
          </>
        )}

        {/* Loading */}
        {loading && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-center text-white/70 mt-6"
          >
            Consultores analisando seu case...
          </motion.div>
        )}

        {/* Resultado Renderizado e Formatado */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white flex flex-col gap-8 mt-10"
          >
            {Object.entries(resultado).map(([titulo, texto]: any, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 p-6 rounded-2xl border border-white/10"
              >
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  {titulo.replace(/_/g, " ")}
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {texto}
                </p>
              </motion.div>
            ))}

            <a
              href="https://wa.me/5511970561448?text=Olá! Quero implementar essa estratégia com a Soo Tech."
              className="text-c
