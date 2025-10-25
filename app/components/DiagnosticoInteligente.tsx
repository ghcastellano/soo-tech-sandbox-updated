"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Resultado = {
  ["Oportunidade Tecnológica"]?: { descricao: string; beneficios?: string[] };
  ["Ganhos de Negócio"]?: { descricao: string; impacto: Record<string, number> };
  ["Caminho rápido ao MVP"]?: string[];
  ["Riscos e Barreiras"]?: string;
  ["Diferenciais Soo Tech"]?: string[];
};

export default function DiagnosticoInteligente() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, idioma: navigator.language })
      });

      const data = await res.json();
      let content = String(data?.content ?? "{}");

      try {
        // sanitização mínima
        content = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(content);
        setResultado(parsed);
      } catch {
        setResultado({ ["Riscos e Barreiras"]: "Ajuste automático: resposta não veio em JSON puro. Tente novamente." });
      }
    } catch (e: any) {
      setErro("Falha ao contactar o serviço de IA. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  const ImpactStars = ({ v }: { v: number }) => {
    if (typeof v !== "number" || v < 0) return null;
    const clamped = Math.max(0, Math.min(5, Math.round(v)));
    return (
      <div className="text-yellow-400">
        {"★".repeat(clamped)}
        {"☆".repeat(5 - clamped)}
      </div>
    );
  };

  const CTA = () => (
    <a
      href="https://wa.me/5511970561448?text=Olá! Quero implementar essa estratégia com a Soo Tech."
      className="mt-6 block text-center bg-primary text-black font-semibold py-4 rounded-xl hover:opacity-90 transition"
    >
      Validar diagnóstico com especialista →
    </a>
  );

  return (
    <div className="relative z-10">
      {/* Card container */}
      <div className="rounded-3xl bg-glass/60 border border-glass shadow-glass backdrop-blur-xl p-6 md:p-10">
        {/* Input */}
        {!resultado && (
          <>
            <label className="block text-white/80 mb-2 font-medium">
              Descreva o seu desafio em poucas linhas
            </label>
            <textarea
              className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/70"
              placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <button
              onClick={gerar}
              disabled={loading || !descricao.trim()}
              className="mt-4 w-full bg-primary text-black font-semibold py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Gerando diagnóstico..." : "Gerar Diagnóstico"}
            </button>
            {erro && <p className="text-red-400 mt-3">{erro}</p>}
          </>
        )}

        {/* Output */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Oportunidade */}
            {resultado["Oportunidade Tecnológica"] && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-primary mb-3">
                  Oportunidade Tecnológica 🌐
                </h3>
                <p className="text-white/80">
                  {resultado["Oportunidade Tecnológica"]?.descricao}
                </p>
                {resultado["Oportunidade Tecnológica"]?.beneficios?.length ? (
                  <ul className="list-disc pl-5 text-white/70 mt-3 space-y-1">
                    {resultado["Oportunidade Tecnológica"]?.beneficios?.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            )}

            {/* Ganhos */}
            {resultado["Ganhos de Negócio"] && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-primary mb-3">
                  Ganhos de Negócio 💹
                </h3>
                <p className="text-white/80">
                  {resultado["Ganhos de Negócio"]?.descricao}
                </p>

                {/* KPI grid */}
                {resultado["Ganhos de Negócio"]?.impacto && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {Object.entries(resultado["Ganhos de Negócio"]!.impacto).map(([k, v]) => (
                      <div key={k} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-white/70 mb-2">{k}</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${Math.min(100, Math.max(0, Number(v) * 20))}%` }}
                          />
                        </div>
                        <ImpactStars v={Number(v)} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* MVP */}
            {resultado["Caminho rápido ao MVP"] && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-primary mb-3">
                  Caminho Rápido ao MVP 🚀
                </h3>
                <ol className="list-decimal pl-5 text-white/80 space-y-1">
                  {resultado["Caminho rápido ao MVP"]?.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* Riscos */}
            {resultado["Riscos e Barreiras"] && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                  Riscos e Barreiras ⚠️
                </h3>
                <p className="text-white/80">
                  {resultado["Riscos e Barreiras"]}
                </p>
              </section>
            )}

            {/* Diferenciais */}
            {resultado["Diferenciais Soo Tech"] && (
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-primary mb-3">
                  Diferenciais Soo Tech ✅
                </h3>
                <ul className="list-disc pl-5 text-white/80 space-y-1">
                  {resultado["Diferenciais Soo Tech"]?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </section>
            )}

            <CTA />
          </motion.div>
        )}
      </div>
    </div>
  );
}
