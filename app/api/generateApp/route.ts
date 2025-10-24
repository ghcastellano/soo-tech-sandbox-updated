// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// --- MASTER PROMPT v4 (Blueprint Estratégico) ---
const systemPrompt = `
Você é um Arquiteto de Soluções Sênior da Soo Tech, especialista em transformar desafios de negócios em soluções inovadoras usando IA, dados e engenharia de software customizada.
Sua tarefa é analisar o desafio ou objetivo de negócio descrito pelo usuário e gerar um **Blueprint Estratégico de Solução de IA** conciso e de alto nível.

**Diretrizes de Geração:**

1.  **Análise Focada:** Interprete o problema sob a ótica das especialidades da Soo Tech (Desenvolvimento de Produtos, Dados & Analytics, Soluções de IA, Outsourcing de especialistas).
2.  **Formato de Saída:** Responda **APENAS** em formato **Markdown**, utilizando exatamente os seguintes cabeçalhos de seção (sem numeração, use ##):
    * \`## Diagnóstico do Desafio\`
    * \`## Visão da Solução Soo Tech\`
    * \`## Pilares Tecnológicos Sugeridos\`
    * \`## Inteligência de Dados Essencial\`
    * \`## Impacto Potencial no Negócio\`
    * \`## Expertise Soo Tech Recomendada\`
    * \`## Próximos Passos com a Soo Tech\`
3.  **Conteúdo:** Conciso, estratégico, profissional. Use termos técnicos corretamente, mas explique o valor. Sugira tecnologias modernas (Cloud, Python/Node, React/Vue, Power BI, etc.).
4.  **SAÍDA:** Responda **APENAS** com o Markdown estruturado. Sem introduções, saudações, ou texto fora dos cabeçalhos definidos.
5.  **Tom:** Consultor Sênior - Confiante, experiente, focado em solução e valor.
6.  **Alinhamento Core:** Certifique-se que a solução proposta reflita as capacidades da Soo Tech.
7.  **CTA na Seção "Próximos Passos com a Soo Tech":** Esta seção é MANDATÓRIA no final. Use um texto similar a este:
    "Este blueprint inicial demonstra o potencial de uma solução customizada. A Soo Tech possui vasta experiência em desafios semelhantes, aplicando IA e análise de dados para gerar resultados comprovados. Quer transformar este conceito em realidade e impulsionar seu negócio? **[Fale com nossos especialistas](mailto:contato@sootech.com?subject=Interesse%20Blueprint:%20[Desafio%20do%20Cliente])** para agendar uma conversa estratégica." 
    *(Adapte o link mailto ou use um link para a página de contato se preferir)*

**Exemplo:** ## Diagnóstico do Desafio
... (exemplo completo) ...
## Próximos Passos com a Soo Tech
... (exemplo completo) ...
`;
// --- FIM DO MASTER PROMPT ---

export async function POST(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API] POST /api/generateApp: Requisição recebida.`);

  try {
    const { prompt } = await req.json();
    console.log(`[${timestamp}] [API] Prompt recebido: ${prompt ? `"${prompt.substring(0, 80)}..."` : "VAZIO"}`);

    if (!prompt || prompt.trim().length === 0) {
        console.error(`[${timestamp}] [API] Erro: Prompt vazio.`);
        return new Response('Por favor, descreva seu desafio de negócio.', { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(`[${timestamp}] [API] Erro Fatal: OPENAI_API_KEY não configurada.`);
      return new Response('Erro interno do servidor [API Key Missing]. Por favor, contate o suporte.', { status: 500 });
    }
    console.log(`[${timestamp}] [API] Chave API OpenAI encontrada (verificada).`);

    const openai = createOpenAI({ apiKey: apiKey });
    console.log(`[${timestamp}] [API] Cliente OpenAI inicializado.`);

    console.log(`[${timestamp}] [API] Chamando streamText com gpt-4o-mini.`);
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Analise este desafio de negócio e gere o blueprint: ${prompt}`,
      // Callback onFinish CORRIGIDO
      onFinish: ({ text, usage, finishReason }) => {
        // Log simplificado para evitar erro de tipo
        console.log(`[${timestamp}] [API] streamText: onFinish - Geração concluída. Razão: ${finishReason}.`); 
        // Se precisar dos tokens, logue o objeto 'usage' inteiro para investigar:
        // console.log(`[${timestamp}] [API] streamText: onFinish - Usage details:`, usage); 
      }
    });
    console.log(`[${timestamp}] [API] Chamada para OpenAI bem-sucedida. Retornando stream...`);

    return result.toTextStreamResponse();

  } catch (error) {
    console.error(`[${timestamp}] [API] ERRO NO BLOCO TRY/CATCH:`, error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorDetails = (error as any)?.data || (error as any)?.cause || error; 
    console.error(`[${timestamp}] [API] Detalhes do Erro:`, JSON.stringify(errorDetails, null, 2));
    return new Response(`Erro interno ao processar a requisição: ${errorMessage}`, { status: 500 });
  }
}

export {};
