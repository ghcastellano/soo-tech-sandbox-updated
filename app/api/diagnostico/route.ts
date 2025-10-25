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
      return new Response(JSON.stringify({ error: "Descrição ausente" }), {
        status: 400,
      });
    }

    const systemPrompt = `
Você é um consultor sênior de IA e Dados. 
Responda SOMENTE no formato JSON abaixo:

{
  "headline": "string",
  "beneficios": [{"titulo":"string","valor":"string"}],
  "impact_score_1a5": number,
  "arquitetura": {"visao":"string","componentes":["string"]},
  "kpis": ["string"],
  "roadmap_90dias": [{"fase":"string","entregas":["string"]}],
  "metricas_execucao": {"roi_estimado_pct":[min,max]}
}

Se faltar informação, assuma premissas conservadoras.
Idioma: ${idioma || "pt-BR"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: descricao },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          controller.enqueue(
            encoder.encode(chunk.choices[0]?.delta?.content || "")
          );
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
