import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { descricao, idioma } = await req.json();

    const system = `
Você é consultor sênior da Soo Tech. ENTREGUE APENAS JSON VÁLIDO no idioma: ${idioma}.
Formato OBRIGATÓRIO:
{
  "Oportunidade Tecnológica": {
    "descricao": "1 parágrafo claro e objetivo",
    "beneficios": ["bullet 1", "bullet 2", "bullet 3"]
  },
  "Ganhos de Negócio": {
    "descricao": "1 parágrafo focado em KPIs",
    "impacto": { "Receita": 1-5, "Eficiência": 1-5, "Retenção": 1-5 }
  },
  "Caminho rápido ao MVP": ["passo 1", "passo 2", "passo 3"],
  "Riscos e Barreiras": "texto curto e honesto",
  "Diferenciais Soo Tech": ["diferencial 1", "diferencial 2", "diferencial 3"]
}
Sem \`\`\`, sem comentários , sem texto fora do JSON.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: String(descricao ?? "") }
      ]
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    return new Response(
      JSON.stringify({ content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Falha ao gerar diagnóstico.", details: err?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
