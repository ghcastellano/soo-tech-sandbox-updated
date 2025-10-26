import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

// Carrega API KEY corretamente no ambiente do Vercel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Prompt com mais profundidade e CTA
const buildPrompt = (descricao: string) => `
Contexto: Você é um Consultor de Transformação Digital na Soo Tech.
Objetivo: Avaliar rapidamente a oportunidade de IA para o cliente com alto valor estratégico.

Empresa/Desafio informado:
"${descricao}"

Responda com:
1) Oportunidades de crescimento com IA (claras e específicas)
2) Estimativas de ganhos: receita, eficiência ou economia
3) Barreiras e como superá-las
4) Recomendação estratégica imediata
5) Convite para conversar com a Soo Tech para cocriar solução (+ confiança)

Formato: Parágrafos curtos e diretos.
Idioma: O mesmo do usuário.
Tonalidade: Consultiva, profissional e moderna.
`;

export async function POST(req: NextRequest) {
  try {
    const { descricao } = await req.json();
    if (!descricao) {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um consultor de IA da Soo Tech." },
        { role: "user", content: buildPrompt(descricao) }
      ],
      temperature: 0.6
    });

    const resposta = response.choices[0].message.content;
    return NextResponse.json({ resultado: resposta });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha ao gerar diagnóstico" }, { status: 500 });
  }
}
