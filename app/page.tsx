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
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    if (!descricao.trim()) return;
    setLoading(true);
    setErro(null);
    setData(null);

    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
      });
      if (!res.ok) {
        throw new Error("Falha ao gerar diagnóstico.");
      }
      const json: Payload = await res.json();
      setData(json);
    } catch (e: any) {
      setErro(e?.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function Stars({ value }: { value: number }) {
    const v = Math.max(0, Math.min(5, Math.floor(value)));
    return (
      <div className="mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < v ? "text-emerald-400" : "text-neutral-700"}>
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-start md:items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        {/* Cabeçalho compacto, sem títulos duplicados */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-emerald-400">Diagnóstico Inteligente</span> Soo Tech
          </h1>
          <p className="mt-2 text-neutral-400">
            Avaliação consultiva para acelerar resultados com IA.
          </p>
        </div>

        {/* Formulário */}
        <section className="rounded-3xl bg-neutral-900/70 border border-neutral-800 p-5 md:p-8 shadow-xl">
          <div className="space-y-4">
            <label className="block text-neutral-300 text-sm md:text-base">
              Descreva seu desafio de negócio
            </label>
            <textarea
              className="w-full min-h-[140px] rounded-xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 px-4 py-3 text-base"
              placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <button
              onClick={gerar}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-neutral-950 font-semibold py-4 transition-colors"
            >
              {loading ? "Gerando análise..." : "Gerar Diagnóstico IA"}
            </button>

            {loading && (
              <p className="text-center text-emerald-400 animate-pulse">📡 Analisando sua oportunidade…</p>
            )}
            {erro && <p className="text-center text-red-400">{erro}</p>}
          </div>

          {/* Resultado estruturado */}
          {data && (
            <div className="mt-8 space-y-6">
              {/* Oportunidade */}
              <Card titulo={data.oportunidade.titulo}>
                <p className="text-neutral-200">{data.oportunidade.descricao}</p>
              </Card>

              {/* Benefícios */}
              {data.beneficios?.length > 0 && (
                <Card titulo="Benefícios esperados">
                  <ul className="space-y-2 text-neutral-200">
                    {data.beneficios.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* KPIs */}
              {data.kpis?.length > 0 && (
                <Card titulo="Indicadores de sucesso (KPIs)">
                  <div className="grid md:grid-cols-2 gap-3 text-neutral-200">
                    {data.kpis.map((k, i) => (
                      <div key={i} className="rounded-xl border border-neutral-800 p-4 bg-neutral-900/50">
                        <p className="font-medium">{k.nome}</p>
                        <p className="text-sm text-neutral-400">Meta: {k.meta}</p>
                        <p className="text-sm text-neutral-400">Prazo: {k.prazo}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Impacto esperado */}
              <Card titulo="Impacto esperado">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-400">Receita</p>
                    <Stars value={data.impacto?.receita ?? 3} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Eficiência</p>
                    <Stars value={data.impacto?.eficiencia ?? 3} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Retenção</p>
                    <Stars value={data.impacto?.retencao ?? 3} />
                  </div>
                </div>
              </Card>

              {/* MVP */}
              {data.mvp?.length > 0 && (
                <Card titulo="Caminho rápido ao MVP">
                  <ol className="list-decimal list-inside space-y-1 text-neutral-200">
                    {data.mvp.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Riscos */}
              {data.riscos?.length > 0 && (
                <Card titulo="Riscos e barreiras">
                  <ul className="space-y-2 text-neutral-200">
                    {data.riscos.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Fechamento + CTA */}
              {(data.fechamento || data.cta_whatsapp) && (
                <Card titulo="Próximos passos">
                  {data.fechamento && <p className="text-neutral-200 mb-3">{data.fechamento}</p>}
                  {data.cta_whatsapp && (
                    <a
                      href={data.cta_whatsapp}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium px-4 py-3 border border-neutral-700"
                    >
                      💬 Falar com especialista no WhatsApp
                    </a>
                  )}
                </Card>
              )}
            </div>
          )}
        </section>

        <footer className="text-center text-xs text-neutral-600 mt-6">
          Powered by Soo Tech AI ⚡
        </footer>
      </div>
    </main>
  );
}

/* Helpers locais */
function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h3 className="text-xl font-semibold mb-3">{titulo}</h3>
      {children}
    </div>
  );
}
