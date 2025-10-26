import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors() });
}

export async function POST(req: NextRequest) {
  try {
    const { descricao } = await req.json();

    const prompt = `
Você é um consultor sênior da Soo Tech, com foco em IA aplicada a crescimento e eficiência.
Gere um diagnóstico objetivo e técnico com profundidade, em PT-BR, para o caso:
"${descricao}"

Saída esperada, nesta ordem:

1) Impact Score (⭐ 1–5): use 5 estrelas reais no texto se for muito promissor.
2) Ganhos de Negócio (com números realistas):
   - receita (+x% a +y%), margem (+x p.p.), CAC (–x%), churn (–x p.p.), lead time (–x%)
   - ROI aproximado (payback em n meses) e um mini-cálculo ilustrativo
3) Riscos e Barreiras:
   - dados, integração, privacidade, readiness do time, change management
   - mitigação recomendada
4) Roadmap em 3 etapas:
   - 0–30 dias (MVP mensurável), 30–90 dias (escala inicial), 90–180 dias (produtização)
5) Benchmark/Case real no mundo:
   - cite 1 referência plausível e tática inovadora aplicada ao contexto
6) Diferenciais da Soo Tech:
   - como aceleramos a captura de valor e reduzimos risco
7) Fecho com CTA breve para continuar com um especialista.

Use bullets concisos, números, e linguagem executiva.
`;

    let resp;
    try {
      resp = await client.responses.create({
        model: "o1-mini",
        input: prompt
      });
    } catch {
      resp = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt
      });
    }

    const text = resp.output_text ?? "Não foi possível gerar o diagnóstico neste momento.";
    return new NextResponse(text, { status: 200, headers: cors() });
  } catch {
    return new NextResponse("Erro ao processar o diagnóstico.", { status: 500, headers: cors() });
  }
}
