// app/api/diagnostico/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

function cors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const desc = String(body.descricao ?? "").slice(0, 500);

    const prompt = `
Você é um consultor sênior da Soo Tech. Gere uma análise estratégica com IA.
Responda em JSON válido com:
{
"Oportunidade Tecnológica": "...",
"Ganhos de Negócio": [...],
"Impact Score": { "Receita":1-5, "Eficiência":1-5, "Retenção":1-5 },
"Riscos e Barreiras": [...],
"Diferenciais Soo Tech": [...],
"Próximos Passos": [...]
}
Descrição do cliente: """${desc}"""
    `;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const content = response.output[0].content[0].text;
    return cors(NextResponse.json(JSON.parse(content)));
  } catch (e) {
    return cors(NextResponse.json({ error: "Erro ao gerar diagnóstico" }, { status: 500 }));
  }
}
