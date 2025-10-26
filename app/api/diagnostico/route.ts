// app/api/diagnostico/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

// CORS básico (mantém embed/Framer e chamadas externas seguras)
function withCORS(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const descricao = String(body?.descricao ?? '').trim();

    // Validações de entrada
    if (!descricao || descricao.length < 30) {
      return withCORS(
        NextResponse.json(
          { error: 'Entrada muito curta para análise.' },
          { status: 400 }
        )
      );
    }

    const letras = (descricao.match(/[a-zA-ZÀ-ú]/g) || []).length;
    const longas = descricao.split(/\s+/).filter((w: string) => w.length >= 5).length;
    if (letras < 8 || longas < 3) {
      return withCORS(
        NextResponse.json(
          { error: 'Texto parece aleatório. Inclua mais contexto do negócio.' },
          { status: 400 }
        )
      );
    }

    // System prompt com formato JSON estrito
    const system = `
Você é um consultor sênior da Soo Tech. Gere um diagnóstico executivo, objetivo e ENXUTO.
Responda ESTRITAMENTE em JSON válido com as chaves:

{
  "titulo": string,
  "impactoScore": number,                      // 1..5
  "ganhos": string[],                          // bullets com métricas aproximadas (ex.: "+8% a +15% receita", CAC -10% a -20%)
  "riscos": string[],                          // riscos objetivos
  "mitigacao": string[],                       // bullets curtas de mitigação
  "roadmap": [{"etapa": string, "descricao": string}],  // 3 itens (0–30 dias, 30–90, 90+)
  "benchmarks": string[],                      // 1–2 cases reais do mundo
  "diferenciais": string[],                    // por que a Soo Tech
  "proximosPassos": string[],                  // 3–5 ações práticas
  "disclaimers": string[]                      // deixe CLARO que métricas e prazos são estimativas e dependem da implementação
}

Regras:
- Não inclua observações fora do JSON.
- Métricas são FAIXAS, não números exatos.
- Evite jargão em excesso; foco em impacto de negócio.
- Idioma: pt-BR.
`;

    const user = `
Desafio do cliente:
"${descricao}"
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Responses API com gpt-4o-mini (compatível)
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
    });

    const text =
      // output_text é o caminho mais direto quando disponível
      // @ts-ignore
      response.output_text ??
      // fallback defensivo
      JSON.stringify(response);

    // Tenta converter para JSON válido
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Se o modelo retornar markdown ou trechos com crases, tenta limpar
      const cleaned = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Sanitização leve dos campos esperados para evitar null/undefined
    const out = {
      titulo: String(parsed?.titulo ?? 'Diagnóstico Técnico: Oportunidade com IA'),
      impactoScore: Number(parsed?.impactoScore ?? 4),
      ganhos: Array.isArray(parsed?.ganhos) ? parsed.ganhos.slice(0, 10) : [],
      riscos: Array.isArray(parsed?.riscos) ? parsed.riscos.slice(0, 10) : [],
      mitigacao: Array.isArray(parsed?.mitigacao) ? parsed.mitigacao.slice(0, 10) : [],
      roadmap: Array.isArray(parsed?.roadmap)
        ? parsed.roadmap.slice(0, 5).map((r: any) => ({
            etapa: String(r?.etapa ?? ''),
            descricao: String(r?.descricao ?? ''),
          }))
        : [],
      benchmarks: Array.isArray(parsed?.benchmarks) ? parsed.benchmarks.slice(0, 5) : [],
      diferenciais: Array.isArray(parsed?.diferenciais) ? parsed.diferenciais.slice(0, 8) : [],
      proximosPassos: Array.isArray(parsed?.proximosPassos) ? parsed.proximosPassos.slice(0, 8) : [],
      disclaimers: Array.isArray(parsed?.disclaimers) ? parsed.disclaimers.slice(0, 5) : [],
    };

    return withCORS(
      NextResponse.json(out, { status: 200 })
    );
  } catch (err: any) {
    // Nunca vaze stack/headers do provedor ao usuário final
    console.error('DIAGNOSTICO_ERROR', err?.message || err);
    return withCORS(
      NextResponse.json(
        {
          error:
            'Não foi possível concluir a análise agora. Tente novamente em instantes.',
        },
        { status: 500 }
      )
    );
  }
}
