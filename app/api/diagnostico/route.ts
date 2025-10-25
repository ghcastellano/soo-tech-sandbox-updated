import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { descricao } = await req.json();

    const system = `
Você é um consultor sênior da Soo Tech. Gere um diagnóstico executivo, conciso e pragmático, SEM texto livre.
Responda ESTRITAMENTE em JSON único e válido (um único objeto), no formato:

{
  "oportunidade": { "titulo": "Oportunidade Tecnológica", "descricao": "..." },
  "beneficios": ["...", "...", "...", "..."],
  "kpis": [
    { "nome": "Aumentar receita", "meta": "X%", "prazo": "90 dias" },
    { "nome": "Reduzir custo", "meta": "Y%", "prazo": "120 dias" }
  ],
  "impacto": { "receita": 1, "eficiencia": 1, "retencao": 1 },
  "mvp": ["Passo 1", "Passo 2", "Passo 3"],
  "riscos": ["Risco 1", "Risco 2", "Risco 3"],
  "fechamento": "Encerramento consultivo curto.",
  "cta_whatsapp": "https://wa.me/5511970561448?text=Quero%20um%20diagn%C3%B3stico%20de%20IA%20para%20minha%20empresa"
}

Regras:
- Use valores de 1 a 5 em "impacto".
- Nada de markdown, comentários, tags ou campos extras.
- Não inclua quebras de linha fora do JSON.
`;

    const user = `Contexto do cliente: ${descricao}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw);

    const payload = {
      oportunidade: json.oportunidade ?? { titulo: "Oportunidade Tecnológica", descricao: "" },
      beneficios: Array.isArray(json.beneficios) ? json.beneficios.slice(0, 4) : [],
      kpis: Array.isArray(json.kpis) ? json.kpis.slice(0, 4) : [],
      impacto: json.impacto ?? { receita: 3, eficiencia: 3, retencao: 3 },
      mvp: Array.isArray(json.mvp) ? json.mvp.slice(0, 3) : [],
      riscos: Array.isArray(json.riscos) ? json.riscos.slice(0, 3) : [],
      fechamento: json.fechamento ?? "",
      cta_whatsapp:
        json.cta_whatsapp ??
        "https://wa.me/5511970561448?text=Quero%20um%20diagn%C3%B3stico%20de%20IA%20para%20minha%20empresa"
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao gerar diagnóstico estruturado." },
      { status: 500 }
    );
  }
}
