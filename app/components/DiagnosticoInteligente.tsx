"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function DiagnosticoInteligente() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erroParser, setErroParser] = useState(false);

  async function gerarDiagnostico() {
    setLoading(true);
    setErroParser(false);
    setResultado(null);

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao, idioma: navigator.language }),
    });

    const data = await res.json();
    let parsedData;

    try {
      const clean = data.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsedData = JSON.parse(clean);
      setResultado(parsedData);
    } catch {
      setErroParser(true);
      setResultado({ texto: data.content });
    }

    setLoading(false);
  }

  const ImpactStars = ({ valor }: any) => {
    if (!valor || typeof valor !== "number") return null;
    return (
      <div className="text-yellow-400 text-xl">
        {"★".repeat(valor)}{"☆".repeat(5 - valor)}
      </div>
    );
  };

  function Card({ titulo, children }: any) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl border border-white/10"
      >
        <h3 className="text-2xl font-bold text-green-400 mb-3">{titulo}</h3>
        {children}
      </motion.div>
    );
  }

  return (
    <section id="diagnostico" className="max-w-4xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-2xl bg-white/5 p-10 rounded-3xl border border-white/10"
      >
        <h2 className="text-4xl font-bold text-white">
          Diagnóstico Inteligente 🚀
        </h2>
        <p className="text-white/60 mb-8">
          Insights estruturados em segundos, do briefing ao conselho.
        </p>

        {!resultado && (
          <>
            <textarea
              className="w-full bg-white/10 p-4 rounded-lg text-white min-h-[120px]"
              placeholder="Descreva seu desafio..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <button
              onClick={gerarDiagnostico}
              disabled={loading}
              className="mt-4 bg-green-500 hover:bg-green-600 text-black font-semibold w-full py-4 rounded-xl transition"
            >
              {loading ? "Gerando..." : "Gerar Diagnóstico"}
            </button>
          </>
        )}

        {loading && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-center text-white/70 mt-6"
          >
            Consultores analisando seu case...
          </motion.div>
        )}

        {erroParser && resultado && (
          <p className="text-red-400 mt-10">
            Formato inesperado, mas a análise já está aqui:
            <br />
            {resultado.texto}
          </p>
        )}

        {resultado && !erroParser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-10 mt-10"
          >
            {resultado["Oportunidade Tecnológica"] && (
              <Card titulo="Oportunidade Tecnológica 🌐">
                <p className="text-white/80 mb-3">
                  {resultado["Oportunidade Tecnológica"].descricao}
                </p>
                <ul className="list-disc pl-5 text-white/70">
                  {resultado["Oportunidade Tecnológica"].beneficios?.map(
                    (b: any, i: number) => <li key={i}>{b}</li>
                  )}
                </ul>
              </Card>
            )}

            {resultado["Ganhos de Negócio"] && (
              <Card titulo="Ganhos de Negócio 💹">
                <p className="text-white/80 mb-3">
                  {resultado["Ganhos de Negócio"].descricao}
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {Object.entries(
                    resultado["Ganhos de Negócio"].impacto
                  ).map(([k, v]: any, i: number) => (
                    <div key={i}>
                      <p className="text-white/60 mb-1">{k}</p>
                      <ImpactStars valor={v} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <motion.a
              href="https://wa.me/5511970561448?text=Olá! Quero implementar essa estratégia com a Soo Tech."
              className="text-center bg-green-500 hover:bg-green-600 text-black font-semibold py-4 rounded-xl transition mt-4"
            >
              Validar com especialista →
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
