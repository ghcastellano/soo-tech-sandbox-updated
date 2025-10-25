"use client";

import { useState } from "react";

type Impacto = { receita: number; eficiencia: number; retencao: number };
type Payload = {
  oportunidade: { titulo: string; descricao: string };
  ganhos: string[];
  impacto: Impacto;
  riscos: string[];
  diferenciais: string[];
  fechamento: string;
  cta_whatsapp: string;
  error?: string;
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
      const json: Payload = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Falha ao gerar diagnóstico.");
      }
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
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-neutral-950 relative">
      {/* mesh/gradiente sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_30%_30%,#00e39433,transparent_50%),radial-gradient(circle_at_70%_70%,#008ae633,transparent_50%)]" />

      <div className="w-full max-w-4xl relative">
        {/* Header compacto */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black">
            <span className="text-emerald-400">Diagnóstico Inteligente</span> Soo Tech
          </h1>
          <p className="text-neutral-300 text-base md:text-lg mt-2">
            Avaliação consultiva personalizada para acelerar seus resultados usando IA.
          </p>
        </div>

        {/* Card de input */}
        <section className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in">
          <label className="text-neutral-300 text-sm font-medium">
            Descreva seu desafio de negócio
          </label>

          <textarea
            className="w-full min-h-[140px] rounded-xl bg-neutral-950 border border-neutral-800 focus:ring-2 focus:ring-emerald-500 px-4 py-3 mt-3 text-neutral-100"
            placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button
            onClick={gerar}
            disabled={loading}
            className="w-full mt-6 py-4 rounded-2xl text-neutral-950 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99]
                       transition-all font-semibold disabled:opacity-60 shadow-[0_0_18px_#00ffbb55]"
          >
            {loading ? "Gerando análise…" : "Gerar Diagnóstico IA 🚀"}
          </button>

          {loading && (
            <div className="mt-4 w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-emerald-400 animate-loading-bar"></div>
            </div>
          )}

          {erro && <p className="mt-4 text-center text-red-400">{erro}</p>}
        </section>

        {/* Resultado em cards */}
        {data && (
          <div className="mt-10 space-y-6 animate-fade-up">
            {/* Oportunidade */}
            <Card titulo={data.oportunidade.titulo}>
              <p className="text-neutral-200">{data.oportunidade.descricao}</p>
            </Card>

            {/* Ganhos de Negócio */}
            {data.ganhos?.length > 0 && (
              <Card titulo="Ganhos de Negócio">
                <ul className="space-y-2 text-neutral-200">
                  {data.ganhos.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Impact Score */}
            <Card titulo="Impact Score">
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

            {/* Riscos e Barreiras */}
            {data.riscos?.length > 0 && (
              <Card titulo="Riscos e Barreiras">
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

            {/* Diferenciais Soo Tech */}
            {data.diferenciais?.length > 0 && (
              <Card titulo="Diferenciais Soo Tech">
                <ul className="space-y-2 text-neutral-200">
                  {data.diferenciais.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{d}</span>
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

        <footer className="text-center text-xs text-neutral-600 mt-8">
          Powered by Soo Tech AI ⚡
        </footer>
      </div>
    </main>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <h3 className="text-xl font-semibold mb-3">{titulo}</h3>
      {children}
    </div>
  );
}
