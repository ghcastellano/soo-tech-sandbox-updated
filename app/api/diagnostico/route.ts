import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

// Variáveis de ambiente: crie em Vercel: Settings → Environment Variables
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors() });
}

export async function POST(req: NextRequest) {
  try {
    const { descricao } = await req.json();

    const prompt = `
    Você é um consultor da Soo Tech, especialista em IA e resultado financeiro.
    Gere uma análise estratégica com:

    • Impact Score: 1–5 ⭐ (com 5 estrelas reais)
    • Ganhos possíveis (ex: +18% receita / –22% custo)
    • Barreiras e riscos
    • Roadmap de implementação com 3 etapas
    • Benchmark e case real no mundo com inovação disruptiva
    • Como a Soo Tech ajuda nisso (breve)
    • CTA final para falar com especialista

    Negócio: ${descricao}
    Idioma: Português do Brasil
    Estrutura em bullet points.
    Texto com profundidade e números realistas.
    `;

    let response;
    try {
      response = await client.responses.create({
        model: "o1-mini",
        input: prompt,
      });
    } catch {
      response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
      });
    }

    const text = response.output_text ?? "Erro ao gerar diagnóstico.";
    return new NextResponse(text, { headers: cors() });
  } catch (e) {
    return new NextResponse("Erro ao processar requisição", { status: 500, headers: cors() });
  }
}
