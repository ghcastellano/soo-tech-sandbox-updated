'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** Componente de estrelas 1–5 */
function Stars({ value = 4 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="inline-flex gap-1" aria-label={`Impacto: ${v} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < v ? 'text-emerald-400' : 'text-zinc-600'}
          style={{ fontSize: 18, lineHeight: 1 }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/** Spinner minimalista para botões */
function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
  );
}

type Diagnostico =
  | {
      content: {
        'Oportunidade Tecnológica': { descricao: string; beneficios: string[] };
        'Ganhos de Negócio': { descricao: string };
        impacto: { Receita: number; Eficiência: number; Retenção: number };
        'Riscos e Barreiras': string[];
        'Diferenciais Soo Tech': string[];
        'Próximos passos'?: string[];
      };
    }
  | null;

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [data, setData] = useState<Diagnostico>(null);

  const whatsURL = useMemo(() => {
    const base = 'https://wa.me/5511970561448';
    const msg = `Olá, equipe Soo Tech! Vi o Diagnóstico IA no site e quero falar com um consultor ⚡️

Resumo do meu desafio:
"${prompt || '—'}"`;
    return `${base}?text=${encodeURIComponent(msg)}`;
  }, [prompt]);

  async function gerar() {
    setErro(null);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: prompt }),
      });

      const txt = await res.text();

      // Tenta JSON estruturado; se vier texto solto, mostra em um bloco único.
      let parsed: Diagnostico = null;
      try {
        parsed = JSON.parse(txt);
      } catch {
        parsed = {
          content: {
            'Oportunidade Tecnológica': {
              descricao: txt,
              beneficios: [],
            },
            'Ganhos de Negócio': { descricao: '' },
            impacto: { Receita: 4, Eficiência: 4, Retenção: 4 },
            'Riscos e Barreiras': [],
            'Diferenciais Soo Tech': [
              'Especialistas práticos em IA aplicada a negócio',
              'Arquiteturas enxutas com foco em ROI',
              'Entrega rápida com governança e segurança',
            ],
            'Próximos passos': [
              'Chamada de 15 min para refinar o escopo',
              'Proposta executiva com roadmap de 4 semanas',
            ],
          },
        };
      }

      setData(parsed);
    } catch (e: any) {
      setErro('Falha ao gerar o diagnóstico. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#AFAFAF]">
      {/* HERO */}
      <section className="px-6">
        <div className="mx-auto max-w-3xl pt-16 pb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-bold text-4xl sm:text-5xl leading-tight text-white"
            style={{ fontFamily: 'Inter, Inter Placeholder, sans-serif' }}
          >
            Entenda como a IA pode acelerar seu crescimento{' '}
            <span className="text-emerald-400">🚀</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="mt-4 text-lg"
            style={{ fontFamily: 'Manrope, Manrope Placeholder, sans-serif' }}
          >
            Conte seu desafio e receba uma análise estratégica feita por IA para
            acelerar seus resultados.
          </motion.p>
        </div>
      </section>

      {/* FORM + RESULTADOS */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-zinc-800 bg-black/30 shadow-[0_0_1px_rgba(0,0,0,.4)] backdrop-blur">
            {/* Label compacta acima, como no seu site */}
            <div className="px-5 pt-6 pb-2">
              <p
                className="text-sm text-zinc-400"
                style={{
                  fontFamily: 'Manrope, Manrope Placeholder, sans-serif',
                }}
              >
                Descreva seu desafio de negócio
              </p>
            </div>

            {/* Input */}
            <div className="px-5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex.: Somos uma fintech e queremos IA para reduzir fraude sem piorar a UX..."
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-[18px] leading-7 text-white outline-none transition focus:ring-2 focus:ring-emerald-500"
                style={{
                  fontFamily: 'Manrope, Manrope Placeholder, sans-serif',
                }}
              />
            </div>

            {/* Botão */}
            <div className="px-5 pb-6 pt-4">
              <button
                onClick={gerar}
                disabled={loading || !prompt.trim()}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontFamily: 'Inter, Inter Placeholder, sans-serif' }}
              >
                {loading ? (
                  <>
                    <Spinner /> <span>Gerando diagnóstico…</span>
                  </>
                ) : (
                  <>
                    Gerar Diagnóstico IA <span>🚀</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <AnimatePresence initial={false}>
            {erro && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-red-300"
              >
                {erro}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton elegante */}
          <AnimatePresence>
            {loading && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 grid gap-4"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-zinc-900/40"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resultados */}
          {data?.content && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 grid gap-4"
            >
              {/* Oportunidade */}
              <Card title="Oportunidade Tecnológica">
                <p className="mb-3">{data.content['Oportunidade Tecnológica'].descricao}</p>
                {!!data.content['Oportunidade Tecnológica'].beneficios?.length && (
                  <ul className="ml-4 list-disc space-y-1">
                    {data.content['Oportunidade Tecnológica'].beneficios.map(
                      (b, i) => (
                        <li key={i}>{b}</li>
                      ),
                    )}
                  </ul>
                )}
              </Card>

              {/* Ganhos */}
              {(data.content['Ganhos de Negócio'].descricao?.trim()?.length ??
                0) > 0 && (
                <Card title="Ganhos de Negócio">
                  <p>{data.content['Ganhos de Negócio'].descricao}</p>
                </Card>
              )}

              {/* Impact Score */}
              <Card title="Impact Score">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Item label="Receita">
                    <Stars value={data.content.impacto.Receita} />
                  </Item>
                  <Item label="Eficiência">
                    <Stars value={data.content.impacto.Eficiência} />
                  </Item>
                  <Item label="Retenção">
                    <Stars value={data.content.impacto.Retenção} />
                  </Item>
                </div>
              </Card>

              {/* Riscos */}
              {!!data.content['Riscos e Barreiras']?.length && (
                <Card title="Riscos e Barreiras">
                  <ul className="ml-4 list-disc space-y-1">
                    {data.content['Riscos e Barreiras'].map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Diferenciais */}
              {!!data.content['Diferenciais Soo Tech']?.length && (
                <Card title="Diferenciais Soo Tech">
                  <ul className="ml-4 list-disc space-y-1">
                    {data.content['Diferenciais Soo Tech'].map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Próximos passos + CTA WhatsApp */}
              <Card title="Próximos passos">
                {data.content['Próximos passos']?.length ? (
                  <ul className="ml-4 list-disc space-y-1">
                    {data.content['Próximos passos']!.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Encerramento consultivo curto.</p>
                )}

                <div className="mt-4">
                  <a
                    href={whatsURL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-900/20 px-4 py-2 text-emerald-300 hover:bg-emerald-800/30"
                    style={{ fontFamily: 'Inter, Inter Placeholder, sans-serif' }}
                  >
                    Conversar com consultor especialista ⚡️
                  </a>
                </div>
              </Card>

              {/* Rodapé sutil */}
              <p
                className="mt-8 text-center text-sm text-zinc-500"
                style={{ fontFamily: 'Manrope, Manrope Placeholder, sans-serif' }}
              >
                Powered by <span className="text-emerald-400">Soo Tech AI</span> ⚡
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

/** Subcomponentes visuais */
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
      <h3
        className="mb-2 text-[15px] font-bold text-white"
        style={{ fontFamily: 'Inter, Inter Placeholder, sans-serif' }}
      >
        {title}
      </h3>
      <div
        className="text-[16px] leading-7"
        style={{ fontFamily: 'Manrope, Manrope Placeholder, sans-serif' }}
      >
        {children}
      </div>
    </div>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
      <p className="mb-1 text-sm text-zinc-400">{label}</p>
      {children}
    </div>
  );
}
