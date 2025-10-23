// Caminho: app/api/generateApp/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

// O "MASTER PROMPT" (Simplificado)
const systemPrompt = `
Gere APENAS o código-fonte React TypeScript para um componente chamado 'App.tsx' 
baseado na descrição do usuário. Nenhuma outra explicação ou text o .
`;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  console.log("API Recebeu o prompt:", prompt); // Mantendo o log

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave de API não encontrada.");
    return new Response('Chave de API do Google não configurada.', { status: 500 });
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  try {
    const result = await streamText({
      // MUDANÇA: Usando o modelo gemini-pro mais antigo
      model: google('models/gemini-pro'), 
      system: systemPrompt,
      prompt: prompt,
    });

    console.log("Chamada para Gemini bem-sucedida. Iniciando stream..."); // Mantendo o log

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    return new Response(`Erro ao chamar a API do Gemini: ${(error as Error).message}`, { status: 500 });
  }
}

export {}; // Mantém a correção para o bug do Vercel
