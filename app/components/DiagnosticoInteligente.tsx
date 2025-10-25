"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiagnosticoInteligente() {
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function gerarDiagnostico(descricao: string) {
    setLoading(true);
    setResultado(null);

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      body: JSON.stringify({
        descricao,
        idioma: navigator.language
      }),
      headers: { "Content-Type": "application/json" }
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }

    try {
      setResultado(JSON.parse(text));
    } catch {
      setResultado({ error: "Erro ao interpretar JSON" });
    }

    setLoading(false);
  }

  return (
    <div id="diagnostico-inteligente"
      className="
      w-full max-w-5xl mx-auto
      backdrop-blur-xl bg-white/10
      border border-white/20
      shadow-[0_0_40px_rgba(255,255,255,0.06)]
      rounded-3xl p-10 md:p-14
      flex flex-col gap-8
      "
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        Diagnóstico Inteligente Soo Tech
      </h2>
      <p className="text-white/80">
        Blueprint Estratégico de IA criado para acelerar seus resultados em minutos.
      </p>

      {!resultado && !loading && (
        <div className="flex gap-4">
          <button
            className="px-6 py-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
            onClick={() => gerarDiagnostico("Sou uma empresa e quero aplicar IA nos meus processos")}
          >
            Gerar Diagnóstico
          </button>
        </div>
      )}

      {loading && (
        <p className="text-white/60 animate-pulse">Gerando diagnóstico…</p>
      )}

      <AnimatePresence>
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {resultado.headline && (
              <h3 className="text-xl text-white font-semibold">
                {resultado.headline}
              </h3>
            )}

            {resultado.beneficios && (
              <section>
                <h4 className="text-white font-semibold mb-2">
                  Benefícios Esperados
                </h4>
                <ul className="grid gap-2">
                  {resultado.beneficios.map((b: any, i: number) => (
                    <li key={i} className="text-white/90">
                      • {b.titulo}: {b.valor}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {resultado.impact_score_1a5 && (
              <section>
                <h4 className="text-white font-semibold mb-1">
                  Impact Score
                </h4>
                <div className="text-yellow-400 text-lg">
                  {"⭐".repeat(resultado.impact_score_1a5)}
                </div>
              </section>
            )}

            {resultado.arquitetura && (
              <section>
                <h4 className="text-white font-semibold mb-1">
                  Arquitetura Sugerida
                </h4>
                <p className="text-white/80">{resultado.arquitetura.visao}</p>
                <ul className="text-white/60 mt-1">
                  {resultado.arquitetura.componentes.map((c: string, i: number) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </section>
            )}

            {resultado.kpis && (
              <section>
                <h4 className="text-white font-semibold mb-1">KPIs</h4>
                <ul className="text-white/80">
                  {resultado.kpis.map((k: string, i: number) => (
                    <li key={i}>• {k}</li>
                  ))}
                </ul>
              </section>
            )}

            <a
              href="https://wa.me/5511970561448?text=Olá! Quero uma avaliação estratégica da Soo Tech."
              target="_blank"
              className="px-6 py-3 rounded-xl bg-green-500 text-white
              hover:bg-green-600 transition-all mt-4 inline-block text-center"
            >
              Falar com Especialista no WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
