"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [descricao, setDescricao] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function gerarDiagnostico() {
    if (!descricao.trim()) return;
    setLoading(true);
    setResultado(null);

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao }),
    });

    const data = await res.json();
    setResultado(data);
    setLoading(false);
  }

  const whatsapp = `https://wa.me/5511970561448?text=${encodeURIComponent(
    "Olá! Gostaria de conversar com a Soo Tech sobre IA no meu negócio! ⚡️"
  )}`;

  const renderStars = (qtd: number) =>
    "⭐".repeat(qtd) + "☆".repeat(5 - qtd);

  return (
    <main className="min-h-screen bg-black flex items-start justify-center px-6">
      <div className="w-full max-w-2xl text-white space-y-8 mt-16 mb-20">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-500">
            Entenda como a IA pode acelerar seu crescimento 🚀
          </h1>
          <p className="text-gray-400 text-sm">
            Conte seu desafio e receba uma análise estratégica criada por IA
            para aumentar eficiência e resultados do seu negócio.
          </p>
        </div>

        {/* Input */}
        <textarea
          className="w-full h-32 p-4 rounded-lg bg-zinc-900 border border-zinc-700
                     focus:border-green-500 outline-none transition"
          placeholder="Ex.: Quero automatizar atendimento para aumentar vendas…"
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
          {loading ? "Gerando análise..." : "Gerar diagnóstico com IA 🚀"}
        </button>

        {/* Loading barra animada */}
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
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Resultado */}
        {resultado && (
          <motion.div
            className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Oportunidades */}
            <section>
              <h3 className="font-semibold text-green-400">
                Oportunidades Tecnológicas 💡
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {resultado.oportunidades}
              </p>
            </section>

            {/* Ganhos */}
            <section>
              <h3 className="font-semibold text-green-400">
                Ganhos de Negócio 📈
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {resultado.ganhos}
              </p>
            </section>

            {/* Impact Score */}
            {resultado.impacto && (
              <section>
                <h3 className="font-semibold text-green-400">
                  Impact Score ⭐
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Receita: {renderStars(resultado.impacto.receita)}</p>
                  <p>Eficiência: {renderStars(resultado.impacto.eficiencia)}</p>
                  <p>Retenção: {renderStars(resultado.impacto.retencao)}</p>
                </div>
              </section>
            )}

            {/* Riscos */}
            <section>
              <h3 className="font-semibold text-green-400">
                Riscos e Barreiras 🚧
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {resultado.riscos}
              </p>
            </section>

            {/* Diferenciais */}
            <section>
              <h3 className="font-semibold text-green-400">
                Como a Soo Tech pode ajudar ⚡️
              </h3>
              <p className="text-gray-300 text-sm whitespace-pre-line">
                {resultado.diferenciais}
              </p>
            </section>

            {/* BTN WA */}
            <a
              href={whatsapp}
              target="_blank"
              className="block text-center w-full py-3 rounded-lg border border-green-500 
                         text-green-400 font-semibold hover:bg-green-600 hover:text-black transition"
            >
              Conversar com consultor especialista ⚡️
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}
