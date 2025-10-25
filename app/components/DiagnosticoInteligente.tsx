"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiagnosticoInteligente() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function gerarDiagnostico() {
    if (!descricao.trim()) return alert("Conte rapidamente sobre seu desafio.");

    setLoading(true);
    setResultado(null);

    const response = await fetch("/api/diagnostico", {
      method: "POST",
      body: JSON.stringify({
        descricao,
        idioma: navigator.language
      }),
      headers: { "Content-Type": "application/json" }
    });

    const json = await response.json();
    setResultado(json);
    setLoading(false);
  }

  return (
    <div className="section-container py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-full max-w-4xl mx-auto
          backdrop-blur-xl bg-white/10 border border-white/20
          rounded-3xl p-10 shadow-[0_0_40px_rgba(0,255,135,0.18)]
          flex flex-col gap-8
        "
      >
        
        {/* Header */}
        <h2 className="text-4xl font-bold text-white leading-tight">
          Diagnóstico Inteligente
        </h2>
        <p className="text-white/70 text-lg">
          Uma análise consultiva da Soo Tech para acelerar seus resultados com IA.
        </p>

        {/* Input */}
        {!resultado && (
          <div className="flex flex-col gap-4">
            <textarea
              placeholder="Ex: Somos uma HealthTech e queremos usar IA para reduzir custos operacionais."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="p-4 rounded-xl bg-white/10 text-white placeholder-white/40 min-h-[120px]"
            />

            <button
              onClick={gerarDiagnostico}
              disabled={loading}
              className="
                py-4 rounded-xl bg-green-500 hover:bg-green-600
                transition font-semibold shadow-lg
              "
            >
              {loading ? "Analisando seu desafio..." : "Gerar Diagnóstico IA"}
            </button>
          </div>
        )}

        {/* Status Indicator */}
        {loading && (
          <div className="flex flex-col gap-2">
            <motion.div
              className="w-full h-2 rounded-full bg-white/20 overflow-hidden"
            >
              <motion.div
                className="h-full bg-green-500"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </motion.div>
            <p className="text-white/60">Consultores analisando oportunidade...</p>
          </div>
        )}

        {/* Resultado */}
        <AnimatePresence>
          {resultado && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-10 mt-4"
            >
              {/* Section: Headline */}
              {resultado?.content && (
                <section>
                  <h3 className="text-3xl font-semibold text-green-400">
                    {resultado.content}
                  </h3>
                </section>
              )}

              {/* CTA final */}
              <motion.a
                href="https://wa.me/5511970561448?text=Olá! Quero avançar com a Soo Tech."
                className="
                  px-6 py-4 rounded-xl bg-green-500 hover:bg-green-600
                  text-center font-semibold mt-4 shadow-[0_0_25px_rgba(0,255,135,0.35)]
                "
              >
                Validar diagnóstico com especialista →
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>

        {resultado && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/50 text-sm mt-2 text-center"
          >
            Análise produzida com base em insights de IA + expertise Soo Tech.
          </motion.p>
        )}

      </motion.div>
    </div>
  );
}
