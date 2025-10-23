// Caminho: app/api/generateApp/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

// O "MASTER PROMPT" (Simplificado)
const systemPrompt = `
Gere APENAS o código-fonte React TypeScript para um componente chamado 'App.tsx' 
baseado na descrição do usuário. Nenhuma outra explicação ou texto.
`;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // LOG PARA DEBUG: Ver o que recebemos do frontend
  console.log("API Recebeu o prompt:", prompt);

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave de API não encontrada."); // Log de erro
    return new Response('Chave de API do Google não configurada.', { status: 500 });
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  try {
    const result = await streamText({
      // MUDANÇA: Usando um modelo PRO mais robusto
      model: google('models/gemini-1.5-pro-latest'), 
      system: systemPrompt,
      prompt: prompt,
    });

    // LOG PARA DEBUG: Ver se a chamada da IA foi bem-sucedida (antes de retornar)
    console.log("Chamada para Gemini bem-sucedida. Iniciando stream...");

    return result.toTextStreamResponse();

  } catch (error) {
    // LOG PARA DEBUG: Capturar erros diretos da chamada da IA
    console.error("Erro ao chamar a API do Gemini:", error);
    return new
