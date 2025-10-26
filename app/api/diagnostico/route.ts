// app/api/diagnostico/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para validar texto
function validarInput(texto: string): boolean {
  if (!texto) return false;
  const invalido = ["asdf", "1234", "teste", "aaaa", "....."];
  if (texto.length < 10) return false;
  if (invalido.some((w) => texto.toLowerCase().includes(w))) return false;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const descricao = String(body?.descricao || "").trim();

    if (!validarInput(descricao)) {
      return NextResponse.json(
        {
          content:
            "Para gerar um diagnóstico preciso com IA, preciso entender melhor seu desafio de negócio. Tente explicar com mais contexto. 😊",
        },
        { status: 200 }
      );
    }

    const prompt = `
Você é um consultor sênior de estratégia em IA da Soo Tech.

Gere um diagnóstico objetivo e estruturado sobre o desafio do usuário:
"${descricao}"

Formato obrigatório da resposta (exatamente nesta estrutura):

**Diagnóstico Estratégico com IA ✅**
(Somente texto, sem código)

1) **Impact Score (estimativa):**
⭐️⭐️⭐️⭐️⭐️ (de acordo com o potencial do caso)

2) **Ganhos de Negócio (estimativas):**
- Mencione receita %
- Margem %
- Redução de custos %
- Lead time %
(Valores devem ser coerentes com a indústria do desafio informado)

📌 *Essas métricas são estimativas iniciais e podem variar segundo contexto, execução e maturidade de dados.*

3) **Riscos e Barreiras:**
- Dados
- Tech
- Pessoas
- Privacidade
- Integração

➜ Incluir mitigação

4) **Roadmap de Transformação (alto nível):**
- 0–30 dias (diagnóstico)
- 30–90 dias (MVP)
- 90–180 dias (escala)

📎 *Roadmap é preliminar e depende de análise aprofundada com especialistas Soo Tech.*

5) **Benchmark / Case Real similar**
- Explicar 1 referência alinhada ao segmento

6) **Diferenciais Soo Tech**
- Expertise multidisciplinar
- Governança de dados
- Sustentação e aceleração contínua

7) **Próximos passos**
📲 Convite para conversar com a Soo Tech via WhatsApp: https://wa.me/5511970561448?text=Quero%20gerar%20crescimento%20com%20IA%20na%20minha%20empresa

IMPORTANTE:
- Linguagem consultiva
- Nada genérico
- Dados contextualizados ao setor do cliente
- Estrutura clara usando Markdown
`;

    const completion = await openai.responses.create({
      model: "o1-mini",
      input: prompt,
      max_output_tokens: 1200,
      temperature: 0.6,
    });

    const texto = completion?.output_text?.trim();

    if (!texto) {
      throw new Error("SEM_CONTEUDO");
    }

    return NextResponse.json({ content: texto });
  } catch (error) {
    console.error("DIAGNOSTICO_ERROR", error);

    return NextResponse.json(
      {
        content:
          "Tivemos uma instabilidade ao gerar o diagnóstico. Nossa equipe já está verificando. Tente novamente em alguns instantes. ⚡️",
      },
      { status: 200 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
