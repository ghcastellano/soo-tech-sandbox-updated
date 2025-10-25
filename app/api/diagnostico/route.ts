import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { descricao, idioma } = await req.json();

    if (!descricao) {
      return new Response(JSON.stringify({ error: "Descrição não informada" }), { status: 400 });
    }

    const systemPrompt = `
Você é um consultor sênior especializado em IA, Dados e Engenharia de Produto.
Retorne um BLUEPRINT ESTRATÉGICO com tom executivo e visão de futuro.

Formato obrigatório de resposta:
{
  "headline": "string",
  "beneficios": [{"titulo":"string","valor":"string"}],
  "impact_score_1a5": number,
  "arquitetura": {"visao":"string","componentes":["string"]},
  "kpis": ["string"],
  "roadmap_90dias": [{"fase":"string","entregas":["string"]}],
  "métricas_execucao": {"roi_estimado_pct":[min,max]}
}

Idioma: ${idioma || "pt-BR"}
Se faltar informação, assuma premissas e sinalize.
Não explique nada fora do JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ou GPT-5 no plano enterprise
      stream: true,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: descricao }
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content || ""));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
