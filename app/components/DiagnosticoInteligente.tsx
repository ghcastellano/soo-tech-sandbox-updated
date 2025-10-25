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
      body: JSON.stringify({
        descricao,
        idioma: navigator.language
      }),
    });

    const data = await res.json();
    let jsonContent = data.content;

    try {
      jsonContent = jsonContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\n/g, " ")
        .trim();

      const parsed = JSON.parse(jsonContent);
      setResultado(parsed);
    } catch (error) {
      console.error("Erro ao tentar converter JSON:", error);
      setResultado({ Erro: "Não foi possível formatar o diagnóstico." });
    }

    setLoading(false);
  }

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
          Insight estratégico e acionável conectado às melhores práticas de IA, dados e engenharia.
        </p>

        {!resultado && (
          <>
            <textarea
              className="w-full p-4 bg-white/10 rounded-xl text-white placeholder-white/30 min-h-[120px]"
              placeholder="Ex: Somos uma HealthTech e queremos usar IA para re
