"use client";
import { useState } from "react";

export default function TesteDiagnostico() {
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);

  async function gerar() {
    setLoading(true);
    setResultado("");

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      body: JSON.stringify({
        descricao: "Sou uma fintech e quero IA",
        idioma: navigator.language
      }),
      headers: { "Content-Type": "application/json" }
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setResultado(prev => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 40 }}>
      <button onClick={gerar}>
        {loading ? "Gerando..." : "Testar Diagnóstico"}
      </button>
      <pre>{resultado}</pre>
    </main>
  );
}
