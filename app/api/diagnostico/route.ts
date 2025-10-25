import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { descricao, idioma } = await req.json();

  const systemPrompt = `Você é um especialista sênior em transformação digital e IA
com foco em resultados financeiros tangíveis.

Sua missão:
Gerar um diagnóstico essencial e altamente profissional
com estas seções:

1. Oportunidade Tecnológica 🧠 
2. Ganhos de Negócio 💹
3. Caminho Rápido até a Prova de Valor 🚀
4. Riscos e Barreiras ⚠️
5. Nossos Diferenciais Soo Tech ✅
6. Impact Score ★★★★★

Sobre a Soo Tech:
Consultoria premium em criação de produtos com IA, dados e engenharia.
Alocamos especialistas e entregamos produtos completos.
Referência em performance e impacto real.

Saída: JSON estruturado.
Nunca diga que é IA. Sempre comunique como consultoria.
Idioma: ${idioma}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: descricao },
    ],
  });

  return new Response(JSON.stringify(completion.choices[0].message), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
