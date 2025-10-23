// Caminho: app/api/generateApp/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

// O "MASTER PROMPT" (MUITO SIMPLIFICADO)
const systemPrompt = `
Gere APENAS o código-fonte React TypeScript para um componente chamado 'App.tsx' 
baseado na descrição do usuário. Nenhuma outra explicação ou texto.
`;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // 1. Lê a chave secreta com segurança
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response('Chave de API do Google não configurada.', { status: 500 });
  }

  // 2. Conecta-se ao Google AI usando a nova SDK
  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  // 3. Gera a resposta
  const result = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    system: systemPrompt,
    prompt: prompt,
  });

  // 4. Envia a resposta de volta para o frontend
  return result.toTextStreamResponse();
}

export {}; // Mantém a correção para o bug do Vercel
