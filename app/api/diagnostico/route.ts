import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { descricao, idioma } = await req.json();

  const systemPrompt = `
Você é consultor sênior da Soo Tech.

VOCÊ DEVE devolver **exatamente este JSON**:

{
  "Oportunidade Tecnológica": {
    "descricao": "explicar o contexto",
    "beneficios": [
      "beneficio claro 1",
      "beneficio claro 2"
    ]
  },
  "Ganhos de Negócio": {
    "descricao": "descrever o impacto nos KPIs",
    "impacto": {
      "Receita": 1-5,
      "Eficiência": 1-5,
      "Retenção": 1-5
    }
  },
  "Caminho rápido ao MVP": [
    "passo 1",
    "passo 2",
    "passo 3"
  ],
  "Riscos e Barreiras": "texto curto e objetivo",
  "Diferenciais Soo Tech": [
    "diferencial 1",
    "diferencial 2"
  ]
}

REQUISITOS:
- Apenas JSON válido
- Sem \`\`\`json ou \`\`\`
- Sem texto fora do JSON
- Idioma conforme: ${idioma}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: descricao },
    ],
    temperature: 0.3
  });

  return new Response(JSON.stringify(completion.choices[0].message), {
    headers: { "Content-Type": "application/json" }
  });
}
