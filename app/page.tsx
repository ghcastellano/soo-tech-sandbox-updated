'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type DiagnosticoResponse = {
  titulo: string;
  impactoScore: number; // 1..5
  ganhos: string[];
  riscos: string[];
  mitigacao: string[];
  roadmap: { etapa: string; descricao: string }[];
  benchmarks: string[];
  diferenciais: string[];
  proximosPassos: string[];
  disclaimers: string[];
};

const WHATSAPP = '5511970561448';

function classNames(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function Estrelas({ n }: { n: number }) {
  return (
    <div className="flex gap-1 text-[#22c55e]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={classNames('text-xl leading-none', i < n ? 'opacity-100' : 'opacity-30')}>
          ★
        </span>
      ))}
    </div>
  );
}

function GlassCard({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  return (
    <section
      ref={ref}
      className={classNames(
        'rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        'p-6 md:p-8 transition-all duration-700',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <h3 className="text-white/90 font-semibold tracking-tight text-xl md:text-2xl mb-3">{title}</h3>
      {children}
    </section>
  );
}

export default function Page() {
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [data, setData] = useState<DiagnosticoResponse | null>(null);

  const phases = useMemo(
    () => [
      'Analisando contexto do seu desafio…',
      'Desenhando estratégia com IA…',
      'Estimando impacto e ROI…',
      'Definindo riscos e mitigação…',
      'Gerando próximos passos…',
    ],
    []
  );

  // Barra de progresso suave durante o loading
  useEffect(() => {
    if (!loading) return;
    setProgress(3);
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p < 85) return p + Math.random() * 6;
        return p;
      });
    }, 380);
    return () => clearInterval(tick);
  }, [loading]);

  // Avança mensagens do loader
  useEffect(() => {
    if (!loading) return;
    setPhase(0);
    const timers = [900, 1400, 1600, 1600, 1200];
    let idx = 0;
    const step = () => {
      if (idx < timers.length - 1) {
        idx += 1;
        setPhase(idx);
        setTimeout(step, timers[idx]);
      }
    };
    const t0 = setTimeout(step, timers[0]);
    return () => clearTimeout(t0);
  }, [loading, phases.length]);

  function validarEntrada(texto: string) {
    const t = texto.trim();
    if (t.length < 30) {
      return 'Conte um pouco mais sobre o contexto. Mínimo de 30 caracteres.';
    }
    // Heurística simples anti-lixo: exige >= 8 letras e 3 palavras “longas”
    const letras = (t.match(/[a-zA-ZÀ-ú]/g) || []).length;
    const longas = t.split(/\s+/).filter((w) => w.length >= 5).length;
    if (letras < 8 || longas < 3) {
      return 'Parece muito curto ou aleatório. Descreva o problema de negócio com 2–3 frases.';
    }
    return null;
  }

  async function handleSubmit() {
    setErro(null);
    setData(null);

    const err = validarEntrada(descricao);
    if (err) {
      setErro(err);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao }),
      });

      // Mesmo com CORS e tratamento, garantimos UX
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Não foi possível gerar o diagnóstico agora.');
      }

      const json: DiagnosticoResponse = await res.json();
      setData(json);
      setProgress(100);
    } catch (e: any) {
      setErro(
        'Não foi possível concluir a análise agora. Já corrigimos o fluxo e você pode tentar novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }

  const zapHref = useMemo(() => {
    const pref = encodeURIComponent(
      'Olá! Quero conversar com um consultor da Soo Tech sobre meu diagnóstico IA e próximos passos.'
    );
    return `https://wa.me/${WHATSAPP}?text=${pref}`;
  }, []);

  return (
    <main className="min-h-dvh w-full bg-[#0b0d0e] text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        {/* Cabeçalho enxuto */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-[32px] md:text-[44px] font-semibold tracking-tight">
            Entenda como a IA pode acelerar seu crescimento{' '}
            <span className="align-middle">🚀</span>
          </h1>
          <p className="text-white/60 mt-3 md:mt-4 text-[16px] md:text-[18px] max-w-3xl mx-auto">
            Conte seu desafio e receba uma análise estratégica feita por IA para acelerar seus resultados.
          </p>
        </div>

        {/* Card principal */}
        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          {/* Sub-header do formulário (texto curto acima da textarea) */}
          <div className="mb-4 md:mb-6">
            <p className="text-white/70 text-[14px] md:text-[15px]">
              Descreva seu desafio de negócio
            </p>
          </div>

          {/* Textarea */}
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
            rows={5}
            className={classNames(
              'w-full resize-none rounded-2xl bg-black/40 border border-white/10 focus:border-emerald-400/50',
              'outline-none p-4 md:p-5 text-[16px] md:text-[18px] placeholder-white/30 text-white',
              'shadow-inner'
            )}
          />

          {/* Ações */}
          <div className="mt-5 md:mt-6 flex flex-col gap-3">
            {erro && (
              <div className="rounded-xl bg-[#2a1212] border border-[#ff3333]/30 text-[#ffbaba] px-4 py-3 text-sm">
                {erro}
              </div>
            )}

            {!loading && (
              <button
                onClick={handleSubmit}
                className={classNames(
                  'rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold',
                  'text-[16px] md:text-[18px] py-4 transition-colors'
                )}
              >
                Gerar diagnóstico com IA 🚀
              </button>
            )}

            {/* Loader elegante */}
            {loading && (
              <div className="rounded-2xl bg-black/40 border border-white/10 px-4 py-5">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white/80 text-sm md:text-[15px]">{phases[phase]}</p>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-white/40">
                  Dica: você pode ajustar seu texto para focar no problema mais crítico, caso queira.
                </p>
              </div>
            )}
          </div>

          {/* Resultado */}
          {data && !loading && (
            <div className="mt-8 md:mt-10 grid gap-4 md:gap-6">
              <GlassCard title={data.titulo} delay={50}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-white/70 text-sm">Impact Score</span>
                  <Estrelas n={Math.max(1, Math.min(5, data.impactoScore || 4))} />
                </div>
              </GlassCard>

              <GlassCard title="Ganhos de Negócio" delay={150}>
                <ul className="list-disc pl-5 text-white/80 leading-relaxed space-y-2">
                  {data.ganhos.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </GlassCard>

              <GlassCard title="Riscos e Barreiras" delay={250}>
                <ul className="list-disc pl-5 text-white/80 leading-relaxed space-y-2">
                  {data.riscos.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>

                {data.mitigacao?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white/80 font-medium mb-2">Mitigação</h4>
                    <ul className="list-disc pl-5 text-white/80 leading-relaxed space-y-2">
                      {data.mitigacao.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </GlassCard>

              <GlassCard title="Roadmap em 3 Etapas" delay={350}>
                <ol className="list-decimal pl-5 text-white/80 leading-relaxed space-y-2">
                  {data.roadmap.map((r, i) => (
                    <li key={i}>
                      <span className="text-white/90 font-medium">{r.etapa}:</span> {r.descricao}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-white/40">
                  Observação: o roadmap é ilustrativo e exige análise aprofundada para validação
                  técnica e de viabilidade, pois foi gerado com suporte de IA.
                </p>
              </GlassCard>

              {data.benchmarks?.length > 0 && (
                <GlassCard title="Benchmark / Case Real" delay={450}>
                  <ul className="list-disc pl-5 text-white/80 leading-relaxed space-y-2">
                    {data.benchmarks.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {data.diferenciais?.length > 0 && (
                <GlassCard title="Diferenciais da Soo Tech" delay={550}>
                  <ul className="list-disc pl-5 text-white/80 leading-relaxed space-y-2">
                    {data.diferenciais.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </GlassCard>
              )}

              {data.proximosPassos?.length > 0 && (
                <GlassCard title="Próximos Passos" delay={650}>
                  <ul className="list-disc pl-5 text-white/80 leading-relaxed space-y-2">
                    {data.proximosPassos.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <a
                      href={zapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[16px] md:text-[17px] py-3 transition-colors"
                    >
                      Conversar com consultor especialista ⚡️
                    </a>
                  </div>
                </GlassCard>
              )}

              {/* Disclaimers fim */}
              {data.disclaimers?.length > 0 && (
                <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                  {data.disclaimers.map((d, i) => (
                    <p key={i} className="text-white/50 text-sm leading-relaxed">
                      {d}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé discreto */}
        <p className="text-center text-white/40 text-sm mt-10">Powered by Soo Tech AI ⚡</p>
      </div>
    </main>
  );
}
