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
    let parsedData;

    try {
      parsedData = JSON.parse(data.content);
    } catch {
      parsedData = data;
    }

    setResultado(parsedData);
    setLoading(false);
  }

  const ImpactStars = ({ valor }: any) => (
    <div className="text-yellow-400 text-xl">
      {"★".repeat(valor)}{"☆".repeat(5 - valor)}
    </div>
  );

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
          Insights estratégicos com o padrão de excelência da Soo Tech.
        </p>

        {!resultado && (
          <>
            <textarea
              className="w-full p-4 bg-white/10 rounded-xl text-white placeholder-white/30 min-h-[120px]"
              placeholder="Descreva seu desafio: ex: Sou uma RetailTech e quero personalizar ofertas com IA."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <button
              onClick={gerarDiagnostico}
              disabled={loading}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-4 rounded-xl transition"
            >
              {loading ? "Gerando..." : "Gerar Diagnóstico"}
            </button>
          </>
        )}

        {loading && (
          <motion.p
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-center text-white/70 mt-6"
          >
            Consultores processando sua estratégia...
          </motion.p>
        )}

        {resultado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white flex flex-col gap-10 mt-10"
          >
            {/* Oportunidade Tecnológica */}
            {resultado["Oportunidade Tecnológica"] && (
              <div className="bg-white/10 p-6 rounded-xl border border-white/10">
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  Oportunidade Tecnológica 🌐
                </h3>
                <p className="text-white/80 mb-3">
                  {resultado["Oportunidade Tecnológica"].descricao}
                </p>
                <ul className="list-disc pl-5 text-white/70">
                  {resultado["Oportunidade Tecnológica"].beneficios?.map(
                    (b: string, i: number) => (
                      <li key={i}>{b}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Ganhos de Negócio */}
            {resultado["Ganhos de Negócio"] && (
              <div className="bg-white/10 p-6 rounded-xl border border-white/10">
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  Ganhos de Negócio 💹
                </h3>
                <p className="text-white/80 mb-3">
                  {resultado["Ganhos de Negócio"].descricao}
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {Object.entries(resultado["Ganhos de Negócio"].impacto).map(
                    ([k, v]: any, i: number) => (
                      <div key={i}>
                        <p className="text-white/60 mb-1">{k}</p>
                        <ImpactStars valor={v} />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Caminho MVP */}
            {resultado["Caminho rápido ao MVP"] && (
              <div className="bg-white/10 p-6 rounded-xl border border-white/10">
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  Caminho Rápido ao MVP 🚀
                </h3>
                <ul className="list-decimal pl-5 text-white/70">
                  {resultado["Caminho rápido ao MVP"].map(
                    (s: string, i: number) => (
                      <li key={i}>{s}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Riscos */}
            {resultado["Riscos e Barreiras"] && (
              <div className="bg-white/10 p-6 rounded-xl border border-white/10">
                <h3 className="text-2xl font-bold text-yellow-400 mb-3">
                  Riscos e Barreiras ⚠️
                </h3>
                <p className="text-white/80">
                  {resultado["Riscos e Barreiras"]}
                </p>
              </div>
            )}

            {/* Diferenciais */}
            {resultado["Diferenciais Soo Tech"] && (
              <div className="bg-white/10 p-6 rounded-xl border border-white/10">
                <h3 className="text-2xl font-bold text-green-400 mb-3">
                  Diferenciais Soo Tech ✅
                </h3>
                <ul className="list-disc pl-5 text-white/70">
                  {resultado["Diferenciais Soo Tech"].map(
                    (d: string, i: number) => (
                      <li key={i}>{d}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            <motion.a
              href="https://wa.me/5511970561448?text=Olá! Quero implementar essa estratégia com a Soo Tech."
              className="text-center bg-green-500 hover:bg-green-600 text-black font-semibold py-4 rounded-xl transition mt-4"
            >
              Validar diagnóstico com especialista →
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
