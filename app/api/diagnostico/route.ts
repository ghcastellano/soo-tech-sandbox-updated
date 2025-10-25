import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

// CORS handler
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
Responda com JSON:
{
"Oportunidade Tecnológica": "...",
"Ganhos de Negócio": ["..."],
"Impact Score": { "Receita":1-5, "Eficiência":1-5, "Retenção":1-5 },
"Riscos e Barreiras": ["..."],
"Diferenciais Soo Tech": ["..."],
"Próximos Passos": ["..."]
}
Descrição do cliente: """${desc}"""
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um consultor sênior da Soo Tech e responde sempre em JSON válido." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const txt = completion.choices[0].message.content;
    const json = JSON.parse(txt);

    return cors(NextResponse.json(json));
  } catch (e) {
    return cors(
      NextResponse.json(
        { error: "Erro ao gerar diagnóstico" },
        { status: 500 }
      )
    );
  }
}
