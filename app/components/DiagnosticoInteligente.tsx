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
        idioma: navigator.language,
      }),
      headers: { "Content-Type": "application/json" },
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
      setResultado({ error: "Erro ao interpretar o JSON gerado." });
    }

    setLoading(false);
  }

  return (
    <section
      id="diagnostico-inteligente"
      className="
        w-full max-w-4xl mx-auto
        backdrop-blur-xl bg-white/10
        border border-white/20
        shadow-[0_0_40px_rgba(255,255,255,0.06)]
        rounded-3xl p-10
        text-white
      "
    >
      <h2 className="text-3xl font-bold mb-2">
        Diagnóstico Inteligente Soo Tech
      </h2>
      <p className="text-white/80 mb-6">
        Blueprint Estratégico de IA criado para acelerar seus resultados em minutos.
      </p>

      {!resultado && !loading && (
        <button
          onClick={() =>
            gerarDiagnostico("Quero aplicar IA nos meus processos.")
          }
          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl"
        >
          Gerar Diagnóstico
        </button>
      )}

      {loading && <p className="animate-pulse">Gerando…</p>}

      <AnimatePresence>
        {resultado && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {resultado.headline && (
              <h3 className="text-xl font-semibold">{resultado.headline}</h3>
            )}

            {resultado.beneficios && (
              <section>
                <h4 className="font-semibold mb-1">Benefícios</h4>
                <ul className="text-white/80">
                  {resultado.beneficios.map((b: any, i: number) => (
                    <li key={i}>• {b.titulo}: {b.valor}</li>
                  ))}
                </ul>
              </section>
            )}

            {resultado.impact_score_1a5 && (
              <section>
                <h4 className="font-semibold mb-1">Impacto Esperado</h4>
                <div className="text-yellow-400 text-lg">
                  {"⭐".repeat(resultado.impact_score_1a5)}
                </div>
              </section>
            )}

            {resultado.arquitetura && (
              <section>
                <h4 className="font-semibold mb-1">Arquitetura Recomendada</h4>
                <p className="text-white/80">{resultado.arquitetura.visao}</p>
                <ul className="text-white/60">
                  {resultado.arquitetura.componentes.map((c: string, i: number) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </section>
            )}

            {resultado.kpis && (
              <section>
                <h4 className="font-semibold mb-1">KPIs</h4>
                <ul className="text-white/80">
                  {resultado.kpis.map((k: string, i: number) => (
                    <li key={i}>• {k}</li>
                  ))}
                </ul>
              </section>
            )}

            <a
              href="https://wa.me/5511970561448?text=Olá! Quero uma avaliação estratégica da Soo Tech."
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl inline-block text-center"
            >
              Falar com Especialista no WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
