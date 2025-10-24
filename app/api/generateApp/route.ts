// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// --- MASTER PROMPT v5 (Foco em HTML Blueprint) ---
const systemPrompt = `
Você é um Arquiteto de Soluções Sênior da Soo Tech. Sua tarefa é gerar um **arquivo HTML único e autônomo** que funcione como um **Blueprint Estratégico** visualmente atraente, baseado na descrição do desafio do usuário.

**Diretrizes:**

1.  **Formato:** Gere um documento HTML5 completo, \`<!DOCTYPE html>...</html>\`.
2.  **Estilização (CSS na Tag <style>):**
    * **Tema:** Tema escuro obrigatório (fundo: #0A0A0A, cards: #151515, texto: #E0E0E0).
    * **Cores Soo Tech:** Use \`#3EFF9B\` (verde) para títulos (h2) e links, e \`#00CFFF\` (ciano) para destaques (como \`<code>\`).
    * **Layout:** Use CSS Flexbox ou Grid para organizar as seções do blueprint de forma limpa e moderna. Deve ser responsivo.
    * **Tipografia:** Use fontes sans-serif (system-ui, Arial).
3.  **Estrutura do Conteúdo:** A IA deve gerar o HTML para as seguintes seções (baseadas no prompt anterior):
    * \`<h2>Diagnóstico do Desafio\`
    * \`<h2>Visão da Solução Soo Tech\`
    * \`<h2>Pilares Tecnológicos Sugeridos\`
    * \`<h2>Inteligência de Dados Essencial\`
    * \`<h2>Impacto Potencial no Negócio\`
    * \`<h2>Expertise Soo Tech Recomendada\`
    * \`<h2>Próximos Passos com a Soo Tech\` (Deve incluir um link \`mailto:contato@sootech.com\` formatado)
4.  **Interatividade:** Adicione JavaScript MÍNIMO (em tags \`<script>\`) apenas para efeitos sutis (ex: hover), se necessário.
5.  **SAÍDA ESTRITA:** Responda **APENAS** com o código HTML. Sem explicações ou markdown \`\`\`.

**Exemplo de Resposta (e NADA MAIS):**
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soo Tech Blueprint</title>
    <style>
        body { font-family: system-ui, sans-serif; background-color: #0A0A0A; color: #E0E0E0; margin: 0; padding: 30px; }
        h2 { color: #3EFF9B; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 30px; font-size: 1.6rem; }
        ul { list-style-type: '→ '; padding-left: 20px; }
        li { margin-bottom: 10px; line-height: 1.6; color: #BDBDBD; }
        p { line-height: 1.7; color: #BDBDBD; }
        code { background-color: rgba(0, 207, 255, 0.1); color: #00CFFF; padding: 3px 6px; border-radius: 4px; font-family: monospace; }
        a { color: #3EFF9B; text-decoration: none; font-weight: bold; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h2>Diagnóstico do Desafio</h2>
    <p>Descrição do problema do cliente...</p>
    <h2>Visão da Solução Soo Tech</h2>
    <p>Nossa proposta de solução...</p>
    <h2>Próximos Passos com a Soo Tech</h2>
    <p>Este blueprint inicial demonstra o potencial de uma solução customizada. A Soo Tech possui vasta experiência em desafios semelhantes. Quer transformar este conceito em realidade? <a href="mailto:contato@sootech.com">Fale com nossos especialistas</a>.</p>
</body>
</html>
`;
// --- FIM DO MASTER PROMPT ---

export async function POST(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API] POST /api/generateApp: Requisição recebida.`);

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      console.error(`[${timestamp}] [API] Erro: Prompt vazio.`);
      return new Response('Prompt não pode ser vazio.', { status: 400 });
    }
    console.log(`[${timestamp}] [API] Prompt recebido: "${prompt.substring(0, 50)}..."`);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(`[${timestamp}] [API] Erro Fatal: OPENAI_API_KEY não configurada.`);
      return new Response('Erro interno do servidor [API Key Missing].', { status: 500 });
    }
    console.log(`[${timestamp}] [API] Chave API OpenAI encontrada.`);

    const openai = createOpenAI({ apiKey: apiKey });
    console.log(`[${timestamp}] [API] Cliente OpenAI inicializado.`);

    console.log(`[${timestamp}] [API] Chamando streamText com gpt-4o-mini.`);
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Analise este desafio de negócio e gere o blueprint HTML: ${prompt}`,
      onFinish: ({ text }) => {
        console.log(`[${timestamp}] [API] streamText: onFinish. Tamanho final: ${text.length}`);
      }
    });
    console.log(`[${timestamp}] [API] Chamada para OpenAI bem-sucedida. Retornando stream.`);
    
    return result.toTextStreamResponse();

  } catch (error) {
    console.error(`[${timestamp}] [API] ERRO NO BLOCO TRY/CATCH:`, error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(`Erro interno ao processar a requisição: ${errorMessage}`, { status: 500 });
  }
}

export {};
