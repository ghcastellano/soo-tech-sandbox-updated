"use client";

import { useState } from "react";
import "./globals.css";

type KPI = { nome: string; meta: string; prazo: string };
type Impacto = { receita: number; eficiencia: number; retencao: number };

type Payload = {
  oportunidade: { titulo: string; descricao: string };
  beneficios: string[];
  kpis: KPI[];
  impacto: Impacto;
  mvp: string[];
  riscos: string[];
  fechamento: string;
  cta_whatsapp: string;
};

export default function Home() {
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Payload | null>(null);

  async function gerar() {
    if (!descricao.trim()) return;
    setLoading(true);
    setData(null);

    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao })
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  return (
    <main className="min-h-screen w-full flex justify-center items-center px-4 py-10 bg-neutral-950">
      <div className="w-full max-w-3xl">
        
        {/* HEADER */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-black">
            <span className="text-emerald-400">Diagnóstico Inteligente</span>{" "}
            Soo Tech
          </h1>
          <p className="text-neutral-400 text-base mt-2">
            Avaliação consultiva para acelerar resultados com IA.
          </p>
        </div>

        {/* CARD FORM */}
        <section className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl animate-fade-in">
          <label className="text-neutral-300 text-sm font-medium">
            Descreva seu desafio de negócio
          </label>

          <textarea
            className="w-full min-h-[140px] rounded-xl bg-neutral-950 border border-neutral-800 focus:ring-2 focus:ring-emerald-500 px-4 py-3 mt-3"
            placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button
            onClick={gerar}
            disabled={loading}
            className="w-full mt-6 py-4 rounded-2xl text-neutral-950 bg-emerald-500 hover:bg-emerald-400 transition-all font-semibold disabled:opacity-60"
          >
            {loading ? "Gerando análise…" : "Gerar Diagnóstico IA 🚀"}
          </button>

          {loading && (
            <div className="mt-4 w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-emerald-400 animate-loading-bar"></div>
            </div>
          )}
        </section>

        {/* RESULTADO */}
        {data && (
          <div className="mt-10 space-y-6 animate-fade-up">

            <Card titulo={data.oportunidade.titulo}>
              <p>{data.oportunidade.descricao}</p>
            </Card>

            <Card titulo="Benefícios esperados">
              <ul className="space-y-2">
                {data.beneficios.map((b: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">•</span> {b}
                  </li>
                ))}
              </ul>
            </Card>

            <Card titulo="KPIs e sucesso">
              <div className="grid md:grid-cols-2 gap-3">
                {data.kpis.map((k, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                    <p className="font-semibold">{k.nome}</p>
                    <p className="text-neutral-400 text-sm">Meta: {k.meta}</p>
                    <p className="text-neutral-400 text-sm">Prazo: {k.prazo}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card titulo="Riscos e barreiras">
              <ul className="space-y-2">
                {data.riscos.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">•</span> {r}
                  </li>
                ))}
              </ul>
            </Card>

            <Card titulo="Próximos passos">
              <p className="mb-4">{data.fechamento}</p>
              <a
                href={data.cta_whatsapp}
                target="_blank"
                className="block w-full text-center rounded-xl border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-neutral-900 py-3 font-semibold transition-all"
              >
                Conversar com especialista ⚡
              </a>
            </Card>
          </div>
        )}

        <footer className="text-center text-xs text-neutral-600 mt-8">
          Powered by Soo Tech AI ⚡
        </footer>
      </div>
    </main>
  );
}

function Card({ titulo, children }: { titulo: string; children: any }) {
  return (
    <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-3 text-neutral-200">{titulo}</h3>
      <div className="text-neutral-300 text-sm">{children}</div>
    </div>
  );
}
