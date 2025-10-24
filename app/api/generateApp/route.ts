// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai'; // Apenas o streamText é necessário aqui

export const runtime = 'edge';

// --- MASTER PROMPT v4 (Blueprint Estratégico) ---
const systemPrompt = `
Você é um Arquiteto de Soluções Sênior da Soo Tech, especialista em transformar desafios de negócios em soluções inovadoras usando IA, dados e engenharia de software customizada.
Sua tarefa é analisar o desafio ou objetivo de negócio descrito pelo usuário e gerar um **Blueprint Estratégico de Solução de IA** conciso e de alto nível.

**Diretrizes de Geração:**

1.  **Análise e Reenquadramento:** Entenda a dor ou a oportunidade do cliente e reescreva-a brevemente em termos de potencial de solução tecnológica.
2.  **Formato de Saída:** Responda **APENAS** em formato **Markdown**, utilizando exatamente os seguintes cabeçalhos de seção (sem numeração, use ##):
    * \`## Diagnóstico do Desafio\`
    * \`## Proposta de Solução (Alto Nível)\`
    * \`## Componentes Tecnológicos Chave\`
    * \`## Fontes de Dados Potenciais\`
    * \`## Impacto Estimado no Negócio\`
    * \`## Perfil de Expertise Recomendado\`
3.  **Conteúdo:**
    * Seja **conciso e estratégico**. Evite jargões excessivos, mas use termos técnicos corretos.
    * Sugira tecnologias e abordagens **modernas e relevantes** (Python, cloud platforms como AWS/GCP/Azure, frameworks modernos, bancos de dados apropriados, modelos de ML relevantes).
    * O impacto deve ser focado no **valor para o negócio**.
    * O perfil de expertise deve listar **funções/skills chave**, não nomes.
4.  **Tom:** Profissional, confiante, experiente, como um consultor sênior.
5.  **SAÍDA ESTRITAMENTE MARKDOWN:** Sua resposta deve conter **APENAS** o Markdown estruturado com os cabeçalhos definidos. Sem introduções, saudações, despedidas ou qualquer outro texto fora dessa estrutura.

**Exemplo de Pedido:** "Minha loja online tem muito abandono de carrinho."

**Sua Resposta (e NADA MAIS):**
## Diagnóstico do Desafio
O abandono de carrinho representa perda de receita direta. A causa pode ser complexa (preço, frete, usabilidade, timing). Uma análise de dados e intervenção inteligente podem recuperar parte dessas vendas.

## Proposta de Solução (Alto Nível)
Implementar um sistema de recuperação de carrinho abandonado baseado em IA, que personalize o timing e o conteúdo das comunicações (email, push) com base no comportamento do usuário e histórico de compras, além de um dashboard para análise de causas.

## Componentes Tecnológicos Chave
- **Backend:** API (Python/FastAPI ou Node.js/NestJS) para lógica de negócio e triggers.
- **Banco de Dados:** Banco de dados do e-commerce (ex: PostgreSQL, MySQL) + possivelmente um data warehouse (ex: BigQuery, Redshift) para análises.
- **Motor de IA:** Modelo de propensão de compra/retorno (Scikit-learn/TensorFlow) treinado nos dados do cliente, hospedado em Cloud AI Platform (ex: Vertex AI, SageMaker).
- **Comunicação:** Integração com plataforma de email marketing/CRM (via API).
- **Frontend/Dashboard:** Painel de visualização (Power BI, Tableau ou React customizado) para monitorar KPIs e insights.

## Fontes de Dados Potenciais
- Histórico de navegação no site (eventos de clique).
- Dados de carrinho (produtos adicionados, removidos, tempo no carrinho).
- Histórico de compras do cliente.
- Dados demográficos (se disponíveis).
- Dados de campanhas de marketing anteriores.

## Impacto Estimado no Negócio
- Recuperação de 5-15% das vendas de carrinhos abandonados.
- Melhoria na compreensão do comportamento do cliente.
- Aumento do LTV (Lifetime Value) do cliente.

## Perfil de Expertise Recomendado
- Engenheiro(a) de Dados
- Cientista de Dados / Engenheiro(a) de ML
- Desenvolvedor(a) Backend
- Especialista em BI/Visualização de Dados
`;
// --- FIM DO MASTER PROMPT ---

export async function POST(req: Request) {
  console.log(`[${new Date().toISOString()}] [API] POST /api/generateApp: Requisição recebida.`);

  try {
    const { prompt } = await req.json();
    console.log(`[${new Date().toISOString()}] [API] Prompt recebido: ${prompt ? `"${prompt.substring(0, 50)}..."` : "VAZIO"}`);

    if (!prompt || prompt.trim().length === 0) {
        console.error(`[${new Date().toISOString()}] [API] Erro: Prompt vazio.`);
        return new Response('Prompt não pode ser vazio.', { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(`[${new Date().toISOString()}] [API] Erro Fatal: OPENAI_API_KEY não configurada.`);
      return new Response('Configuração interna do servidor incompleta.', { status: 500 });
    }
    console.log(`[${new Date().toISOString()}] [API] Chave API OpenAI encontrada (verificada).`);

    const openai = createOpenAI({ apiKey: apiKey });
    console.log(`[${new Date().toISOString()}] [API] Cliente OpenAI inicializado.`);

    console.log(`[${new Date().toISOString()}] [API] Chamando streamText com gpt-4o-mini.`);
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Analise este desafio de negócio e gere o blueprint: ${prompt}`,
      onFinish: (({ text }) => { // Callback para logar quando a stream interna termina
        console.log(`[${new Date().toISOString()}] [API] streamText: onFinish interno. Tamanho final: ${text.length}`);
      })
    });
    console.log(`[${new Date().toISOString()}] [API] Chamada para streamText concluída. Retornando stream.`);

    // Retorna a stream diretamente para o cliente
    return result.toTextStreamResponse();

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [API] ERRO NO BLOCO TRY/CATCH:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = (error as any)?.data || (error as any)?.cause || error;
    console.error(`[${new Date().toISOString()}] [API] Detalhes do Erro:`, JSON.stringify(errorDetails, null, 2));
    return new Response(`Erro interno ao processar a requisição: ${errorMessage}`, { status: 500 });
  }
}

export {};
