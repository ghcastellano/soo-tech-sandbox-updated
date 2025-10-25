// app/api/diagnostico/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// CORS helper
function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const descricao = String(body?.descricao ?? body?.prompt ?? "").slice(0, 4000);

    const system = `
Você é um consultor sênior da Soo Tech. Gere um diagnóstico executivo, objetivo e acionável.
Responda ESTRITAMENTE em JSON único e válido com os campos:

{
  "oportunidade": { "titulo": "Oportunidade Tecnológica", "descricao": "..." },
  "ganhos": ["...", "...", "...", "..."],
  "impacto": { "receita": 1, "eficiencia": 1, "retencao": 1 },
  "riscos": ["...", "...", "..."],
  "diferenciais": ["...", "...", "..."],
  "fechamento": "Encerramento consultivo curto.",
  "cta_whatsapp": "https://wa.me/5511970561448?text=Quero%20um%20diagn%C3%B3stico%20de%20IA%20para%20minha%20empresa"
}

Regras:
- "impacto" é inteiro de 1 a 5 em cada eixo.
- Sem markdown, sem comentários, sem texto fora do JSON.
- Uma única linha JSON.
`;

    const user = `Contexto do cliente: ${descricao || "Sem detalhes adicionais."}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return cors(
        NextResponse.json({ error: `OpenAI error: ${text}` }, { status: 500 })
      );
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw);

    const payload = {
      oportunidade: json.oportunidade ?? { titulo: "Oportunidade Tecnológica", descricao: "" },
      ganhos: Array.isArray(json.ganhos) ? json.ganhos.slice(0, 4) : [],
      impacto: {
        receita: Math.max(1, Math.min(5, Number(json?.impacto?.receita ?? 3))),
        eficiencia: Math.max(1, Math.min(5, Number(json?.impacto?.eficiencia ?? 3))),
        retencao: Math.max(1, Math.min(5, Number(json?.impacto?.retencao ?? 3)))
      },
      riscos: Array.isArray(json.riscos) ? json.riscos.slice(0, 4) : [],
      diferenciais: Array.isArray(json.diferenciais) ? json.diferenciais.slice(0, 4) : [],
      fechamento: json.fechamento ?? "",
      cta_whatsapp:
        json.cta_whatsapp ??
        "https://wa.me/5511970561448?text=Quero%20um%20diagn%C3%B3stico%20de%20IA%20para%20minha%20empresa"
    };

    return cors(NextResponse.json(payload));
  } catch {
    return cors(
      NextResponse.json({ error: "Falha ao gerar diagnóstico estruturado." }, { status: 500 })
    );
  }
}
