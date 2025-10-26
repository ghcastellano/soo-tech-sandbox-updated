"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function gerar() {
    if (!descricao.trim()) return;
    setLoading(true);
    setResultado("");
    setErro("");

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
      });

      if (!res.body) {
        const texto = await res.text();
        throw new Error(texto || "Falha ao gerar diagnóstico.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResultado(prev => prev + decoder.decode(value));
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao gerar diagnóstico.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white px-4 py-16 flex flex-col items-center">
      {/* Container central */}
      <div className="w-full max-w-3xl">
        {/* Microcopy alinhada ao site */}
        <div className="text-center space-y-2">
          <p className="text-[18px] leading-relaxed text-[#AFAFAF]">
            Transformamos seus dados no caminho mais curto para o lucro. Sem soluções genéricas.
          </p>
        </div>

        {/* Card principal */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_0_60px_rgba(0,255,120,0.05)]">
          <div className="p-6 md:p-8">
            {/* Headline discreta interna */}
            <div className="text-center mb-5">
              <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">
                Conte seu desafio e receba uma análise estratégica feita por IA para acelerar seus resultados.
              </h2>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <label className="block text-sm text-[#AFAFAF]">
                Descreva seu desafio de negócio
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Fintech quer aumentar conversão de conta digital em 20% reduzindo CAC e melhorando KYC com IA."
                className="w-full h-40 resize-none rounded-xl bg-black/40 text-gray-200 border border-white/10 focus:border-emerald-400 outline-none p-4 transition"
              />

              <button
                onClick={gerar}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-[16px] font-semibold transition disabled:opacity-60"
              >
                {loading ? "Gerando análise..." : "Gerar Diagnóstico"}
              </button>
            </div>

            {/* Loader */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-6"
                >
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: ["-100%", "0%", "100%"] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full w-1/3 bg-gradient-to-r from-emerald-400/20 via-emerald-400 to-emerald-400/20"
                    />
                  </div>
                  <p className="mt-3 text-center text-sm text-[#AFAFAF]">
                    Analisando impacto, ROI e benchmarks...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Erro */}
            {erro && (
              <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                {erro}
              </div>
            )}

            {/* Resultado */}
            {/* Resultado aprimorado */}
<AnimatePresence>
  {resultado && !loading && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 space-y-8 text-[17px] leading-relaxed tracking-wide text-[#E6E6E6] font-normal"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* Chips superiores */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/40 text-emerald-300 text-sm">
          ⭐ Impacto Estratégico
        </span>
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm">
          ROI estimado incluso
        </span>
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-sm">
          Roadmap 0–180 dias
        </span>
      </div>

      {/* Conteúdo segmentado */}
      <div className="space-y-8">
        {resultado.split(/\d\)\s\*\*/).map((section, index) => {
          if (!section.trim()) return null;

          const numero = index + 1;
          const titulo = section.split("**")[0]?.trim();
          const conteudo = section.replace(`${titulo}**`, "").trim();

          const tituloAjustado =
            numero === 7
              ? "7) Próximos passos"
              : `${numero}) ${titulo}`;

          return (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_0_40px_rgba(0,255,120,0.04)]"
            >
              <h3 className="text-[20px] font-semibold text-white mb-3">
                {tituloAjustado}
              </h3>
              <p className="whitespace-pre-wrap text-[#D4D4D4] text-[16px] leading-[1.6]">
                {conteudo}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.a
        href={`https://wa.me/5511970561448?text=Olá!%20Li%20meu%20Diagnóstico%20IA%20no%20site%20da%20Soo%20Tech%20e%20quero%20falar%20com%20um%20consultor.`}
        target="_blank"
        className="block text-center mt-4 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-300 text-black font-semibold text-[17px] hover:scale-[1.02] transition-transform"
      >
        Falar com um Consultor Especialista ⚡️
      </motion.a>

      <p className="text-xs text-[#AFAFAF] text-center">
        A Soo Tech já impulsionou resultados em projetos semelhantes, unindo IA, automação e analytics com ROI rápido.
      </p>
    </motion.div>
  )}
</AnimatePresence>

          </div>
        </div>
      </div>
    </main>
  );
}
