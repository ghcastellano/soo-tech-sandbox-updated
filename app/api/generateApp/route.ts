// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText, StreamingTextResponse, StreamData } from 'ai'; // Adicionar StreamingTextResponse e StreamData explicitamente se necessário

export const runtime = 'edge';

// --- MASTER PROMPT v4 (Mantido) ---
const systemPrompt = `
Você é um Arquiteto de Soluções Sênior da Soo Tech...
// ... (manter o prompt detalhado completo) ...
`;
// --- FIM DO MASTER PROMPT ---

export async function POST(req: Request) {
  console.log(`[${new Date().toISOString()}] [API] POST /api/generateApp: Requisição recebida.`);

  try {
    const { prompt } = await req.json();
    console.log(`[${new Date().toISOString()}] [API] Prompt extraído: ${prompt ? `"${prompt.substring(0, 50)}..."` : "VAZIO"}`);

    if (!prompt || prompt.trim().length === 0) {
        console.error(`[${new Date().toISOString()}] [API] Erro: Prompt vazio.`);
        return new Response('Prompt não pode ser vazio.', { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(`[${new Date().toISOString()}] [API] Erro Fatal: OPENAI_API_KEY não configurada no Vercel.`);
      return new Response('Configuração interna do servidor incompleta.', { status: 500 });
    }
    console.log(`[${new Date().toISOString()}] [API] Chave API OpenAI encontrada (últimos 4 chars): ...${apiKey.slice(-4)}`);

    const openai = createOpenAI({ apiKey: apiKey });
    console.log(`[${new Date().toISOString()}] [API] Cliente OpenAI inicializado.`);

    console.log(`[${new Date().toISOString()}] [API] Preparando para chamar streamText com modelo 'gpt-4o-mini'.`);

    // Adicionando um objeto StreamData para rastreamento (opcional, mas útil)
    const data = new StreamData();
    data.append({ message: 'Stream Iniciada do Backend' });

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Analise este desafio de negócio e gere o blueprint: ${prompt}`,
      // Callbacks para logar eventos da stream (se suportados pela versão)
      onStart: async () => {
         console.log(`[${new Date().toISOString()}] [API] streamText: Evento onStart recebido.`);
         data.append({ event: 'start' }); // Envia um marcador para o frontend
      },
      onToken: async (token) => {
         // Logar talvez o primeiro token ou a cada X tokens para não poluir muito
         // console.log(`[${new Date().toISOString()}] [API] streamText: Token recebido: ${token}`);
      },
      onCompletion: async (completion) => {
         console.log(`[${new Date().toISOString()}] [API] streamText: Evento onCompletion recebido. Tamanho: ${completion.length}`);
         data.append({ event: 'completion', length: completion.length }); // Envia marcador
      },
      onFinal: async (completion) => {
         console.log(`[${new Date().toISOString()}] [API] streamText: Evento onFinal recebido. Tamanho final: ${completion.length}`);
         data.append({ event: 'final' }); // Envia marcador
         data.close(); // Fecha o objeto StreamData
      },
      // experimental_streamData: true // Ativa o envio do objeto 'data'
    });

    console.log(`[${new Date().toISOString()}] [API] Chamada para streamText retornou. Preparando resposta...`);

    // Retorna a stream E os dados adicionais
    return result.toTextStreamResponse();
    // Alternativa se experimental_streamData estiver ativo:
    // return new StreamingTextResponse(result.toAIStream({
    //    onClose: () => {
    //        console.log(`[${new Date().toISOString()}] [API] AIStream fechada.`);
    //    }
    // }), {}, data);


  } catch (error) {
    console.error(`[${new Date().toISOString()}] [API] ERRO NO BLOCO TRY/CATCH:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = (error as any)?.data || (error as any)?.cause || error; // Tenta pegar mais detalhes
    console.error(`[${new Date().toISOString()}] [API] Detalhes do Erro:`, JSON.stringify(errorDetails, null, 2));
    return new Response(`Erro interno ao processar a requisição: ${errorMessage}`, { status: 500 });
  }
}

export {};
