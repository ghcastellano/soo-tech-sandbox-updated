// Caminho: app/api/generateApp/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'edge';

// O "MASTER PROMPT"
const systemPrompt = `
Sua tarefa é gerar o código-fonte para um único componente React chamado 'App.tsx' 
baseado no pedido do usuário.

REGRAS:
1.  Use React, TypeScript e Tailwind CSS.
2.  O código DEVE ser 100% autônomo.
3.  NÃO inclua NENHUMA explicação, NENHUM markdown ('\`\`\`'), 
    NENHUM comando 'npm install'.
4.  Responda APENAS com o código-fonte puro.

Exemplo de Pedido: "uma landing page com um título e um botão"
Sua Resposta (e NADA MAIS):
import React from 'react';
export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Nosso Site</h1>
      <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        Começar
      </button>
    </div>
  );
}
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

export {}; // <-- ESTA É A CORREÇÃO MÁGICA
