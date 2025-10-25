import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { descricao } = await req.json();

  const prompt = `
Você é um consultor de negócios e IA da Soo Tech.
Escreva um diagnóstico CONVERSACIONAL, fluido e prático.
Inclua:

▸ Oportunidade Tecnológica
▸ Benefícios imediatos
▸ Indicadores de sucesso
▸ Roteiro de MVP (em 3 passos)
▸ Fechamento consultivo

Contexto do cliente: ${descricao}
`;

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [{ role: "user", content: prompt }]
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
