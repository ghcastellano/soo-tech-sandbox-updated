"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DiagnosticoInteligente() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function gerar() {
    if (!descricao.trim()) return alert("Descreva sua necessidade primeiro");

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
      setResultado({ error: "Erro ao interpretar o diagnóstico." });
    }

    setLoading(false);
  }

  return (
    <div
      id="diagnostico-inteligente"
      className="
        w-full max-w-5xl mx-auto
        backdrop-blur-2xl bg-white/10
        border border-white/20
        shadow-[0_0_40px_rgba(255,255,255,0.08)]
        rounded-3xl p-10
        text-white flex flex-col gap-8
      "
    >
      {/* Título */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold"
      >
        Diagnóstico Inteligente Soo Tech
      </motion.h2>

      {/* Descrição */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white/70"
      >
        Conte seu desafio e receba uma avaliação estratégica de IA criada especialmente para sua realidade.
      </motion.p>

      {/* Input */}
      {!resultado && (
        <div className="flex flex-col gap-4">
          <textarea
            placeholder="Ex: Sou uma startup de fintech e quero automatizar meu onboarding com IA."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="p-4 rounded-xl bg-white/10 text-white placeholder-white/40 min-h-[100px]"
          />

          <button
            onClick={gerar}
            disabled={loading}
            className="py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
          >
            {loading ? "Gerando diagnóstico..." : "Gerar Diagnóstico"}
          </button>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white/70"
        >
          Procesando dados e criando estratégia...
        </motion.p>
      )}

      {/* Resultado */}
      {resultado && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-6"
        >
          {resultado.headline && (
            <section>
              <h3 className="text-2xl font-semibold mb-2">
                {resultado.headline}
              </h3>
            </section>
          )}

          {/* Benefícios */}
          {resultado.beneficios && (
            <section>
              <h4 className="font-semibold mb-2 text-white/90">Benefícios</h4>
              <ul className="text-white/75 space-y-1">
                {resultado.beneficios.map((b: any, i: number) => (
                  <li key={i}>• {b.titulo}: {b.valor}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Impact Score */}
          {resultado.impact_score_1a5 && (
            <section>
              <h4 className="font-semibold mb-1">Impacto Esperado</h4>
              <div className="text-yellow-400 text-lg">
                {"⭐".repeat(resultado.impact_score_1a5)}
              </div>
            </section>
          )}

          {/* CTA */}
          <a
            href="https://wa.me/5511970561448?text=Olá! Quero entender como implementar essa estratégia com a Soo Tech."
            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-center mt-4"
          >
            Falar com Especialista no WhatsApp
          </a>
        </motion.div>
      )}
    </div>
  );
}
