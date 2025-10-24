// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge'; // Essencial para Vercel Functions

// --- MASTER PROMPT v5 ---
// Foco em Blueprint Estratégico, Alinhamento Soo Tech e CTA
const systemPrompt = `
Você é um Arquiteto de Soluções Sênior da Soo Tech. Sua missão é analisar desafios de negócios complexos e esboçar um Blueprint Estratégico inicial, demonstrando como a Soo Tech pode alavancar Dados, IA, e Engenharia de Software Sob Medida para gerar performance e resultados tangíveis.

**Tarefa:** Analise o desafio/objetivo do usuário e gere um **Blueprint Estratégico** em **Markdown**.

**Diretrizes:**

1.  **Análise Focada:** Interprete o problema sob a ótica das especialidades da Soo Tech (Desenvolvimento de Produtos, Dados & Analytics, Soluções de IA, Outsourcing de especialistas).
2.  **Estrutura OBRIGATÓRIA (Use EXATAMENTE estes cabeçalhos Markdown):**
    * \`## Diagnóstico do Desafio\` (Breve reenquadramento do problema)
    * \`## Visão da Solução Soo Tech\` (Proposta de alto nível, conectando com IA/Dados)
    * \`## Pilares Tecnológicos Sugeridos\` (Principais componentes: backend, IA/ML, dados, frontend/visualização)
    * \`## Inteligência de Dados Essencial\` (Tipos de dados a serem explorados)
    * \`## Impacto Potencial no Negócio\` (Benefícios tangíveis esperados)
    * \`## Expertise Soo Tech Recomendada\` (Perfis de especialistas necessários - sutilmente promovendo outsourcing)
    * \`## Próximos Passos com a Soo Tech\` (Seção de CTA - veja instrução 7)
3.  **Conteúdo:** Conciso, estratégico, profissional. Use termos técnicos corretamente, mas explique o valor. Sugira tecnologias modernas (Cloud, Python/Node, React/Vue, Power BI, etc.).
4.  **SAÍDA:** Responda **APENAS** com o Markdown estruturado. Sem introduções, saudações, ou texto fora dos cabeçalhos definidos.
5.  **Tom:** Consultor Sênior - Confiante, experiente, focado em solução e valor.
6.  **Alinhamento Core:** Certifique-se que a solução proposta reflita as capacidades da Soo Tech (não sugira coisas fora do escopo, como hardware).
7.  **CTA na Seção "Próximos Passos com a Soo Tech":** Esta seção é MANDATÓRIA no final. Use um texto similar a este:
    "Este blueprint inicial demonstra o potencial de uma solução customizada. A Soo Tech possui vasta experiência em desafios semelhantes, aplicando IA e análise de dados para gerar resultados comprovados. Quer transformar este conceito em realidade e impulsionar seu negócio? **[Fale com nossos especialistas](mailto:contato@sootech.com?subject=Interesse%20Blueprint:%20[Desafio%20do%20Cliente])** para agendar uma conversa estratégica." 
    *(Adapte o link mailto ou use um link para a página de contato se preferir)*

**Exemplo:** (Manter o exemplo do abandono de carrinho aqui, adaptando os cabeçalhos se necessário)
## Diagnóstico do Desafio
...
## Visão da Solução Soo Tech
...
## Pilares Tecnológicos Sugeridos
...
## Inteligência de Dados Essencial
...
## Impacto Potencial no Negócio
...
## Expertise Soo Tech Recomendada
...
## Próximos Passos com a Soo Tech
Este blueprint inicial demonstra o potencial de uma solução customizada para recuperação de carrinhos. A Soo Tech possui vasta experiência em desafios semelhantes no e-commerce, aplicando IA e análise de dados para gerar resultados comprovados. Quer transformar este conceito em realidade e impulsionar suas vendas? **[Fale com nossos especialistas](mailto:contato@sootech.com?subject=Interesse%20Blueprint:%20Abandono%20Carrinho)** para agendar uma conversa estratégica.
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
    console.log(`[${timestamp}] [API] Chave API OpenAI encontrada e válida.`);

    const openai = createOpenAI({ apiKey: apiKey });
    console.log(`[${timestamp}] [API] Cliente OpenAI inicializado.`);

    console.log(`[${timestamp}] [API] Chamando streamText com gpt-4o-mini.`);
    const result = await streamText({
      model: openai('gpt-4o-mini'), // Modelo balanceado
      system: systemPrompt,
      prompt: `Analise este desafio de negócio e gere o blueprint: ${prompt}`,
      // Adicionando um callback onFinish para log final no backend
      onFinish: ({ text, usage, finishReason }) => {
        console.log(`[${timestamp}] [API] streamText: onFinish - Geração concluída. Razão: ${finishReason}, Tokens Usados: ${usage.completionTokens}`);
      }
    });
    console.log(`[${timestamp}] [API] Chamada para OpenAI bem-sucedida. Retornando stream...`);
    return result.toTextStreamResponse();

  } catch (error) {
    console.error(`[${timestamp}] [API] ERRO NO BLOCO TRY/CATCH:`, error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    // Tenta extrair mais detalhes do erro da AI SDK
    const errorDetails = (error as any)?.data?.error?.message || (error as any)?.cause || error;
    console.error(`[${timestamp}] [API] Detalhes do Erro:`, JSON.stringify(errorDetails));
    // Retorna uma mensagem mais genérica para o frontend
    return new Response(`Ocorreu um erro ao processar sua solicitação com a IA. Detalhes: ${errorMessage}`, { status: 500 });
  }
}

export {};
