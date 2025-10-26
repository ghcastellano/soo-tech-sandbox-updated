"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Page() {
  const [descricao, setDescricao] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string>("");

  async function gerar() {
    try {
      setLoading(true);
      setResultado("");

      const inputSanitizado = descricao.trim();

      if (!inputSanitizado || inputSanitizado.length < 10) {
        setLoading(false);
        setResultado(
          "Por favor, descreva seu desafio com um pouco mais de detalhes para gerarmos um diagnóstico preciso. 😊"
        );
        return;
      }

      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descricao: inputSanitizado }),
      });

      if (!res.ok) {
        throw new Error("API_ERROR");
      }

      const data = await res.json();

      if (!data?.content) {
        throw new Error("INVALID_RESPONSE");
      }

      setResultado(data.content);
    } catch (e) {
      setResultado(
        "Ops... Tivemos um imprevisto ao gerar seu diagnóstico. Nossa equipe já foi notificada e estamos cuidando disso. Tente novamente em instantes. ⚡️"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-10 flex flex-col items-center">
      
      {/* Título */}
      <h1 className="text-[36px] md:text-[52px] font-bold text-emerald-300 text-center">
        Entenda como a IA pode acelerar seu crescimento 🚀
      </h1>

      {/* Subtítulo */}
      <p className="text-[18px] text-gray-300 mt-2 text-center max-w-2xl">
        Conte seu desafio e receba uma análise estratégica feita por IA para acelerar
        seus resultados de negócio.
      </p>

      {/* Container do Form */}
      <div className="bg-[#101010] mt-10 p-6 rounded-2xl shadow-xl border border-emerald-800/40 w-full max-w-3xl">
        
        <label className="text-[20px] text-emerald-300 font-semibold">
          Descreva seu desafio de negócio
        </label>

        <textarea
          className="w-full bg-black/80 border border-emerald-600/30 rounded-xl p-4 mt-2 h-36 text-[18px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Ex.: Somos uma empresa e queremos IA para reduzir fraudes sem piorar a UX..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={gerar}
          disabled={loading}
          className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-[20px]"
        >
          {loading ? "Gerando diagnóstico..." : "Gerar Diagnóstico IA 🚀"}
        </motion.button>

        {/* Resultado */}
        <div className="mt-8 whitespace-pre-line text-[18px] leading-relaxed text-gray-200">
          {loading && (
            <motion.div
              className="text-center text-emerald-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              Analisando seus dados estratégicos... 🔍⚡️
            </motion.div>
          )}

          {!loading && resultado && (
            <div
              dangerouslySetInnerHTML={{
                __html: resultado,
              }}
            />
          )}
        </div>

        {/* Rodapé */}
        <p className="text-center text-gray-500 text-[14px] mt-8">
          Powered by Soo Tech AI ⚡️
        </p>
      </div>
    </div>
  );
}
