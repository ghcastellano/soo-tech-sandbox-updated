// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai'; // Importa a SDK correta
import { streamText } from 'ai';

export const runtime = 'edge';

// O "MASTER PROMPT" (Ajustado para GPT e sem Tailwind)
const systemPrompt = `
Sua tarefa é gerar o código-fonte para um único componente React chamado 'App.tsx' 
baseado na descrição do usuário.

REGRAS:
1.  Use React, TypeScript e estilos inline (inline styles). NÃO use classes Tailwind.
2.  O código DEVE ser 100% autônomo.
3.  NÃO inclua NENHUMA explicação, NENHUM markdown ('\`\`\`'), 
    NENHUM comando 'npm install'.
4.  Responda APENAS com o código-fonte puro.

Exemplo de Pedido: "uma landing page com um título e um botão"
Sua Resposta (e NADA MAIS):
import React from 'react';
export default function App() {
  const containerStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', minHeight: '100vh', 
    backgroundColor: '#111', color: 'white', padding: '20px'
  };
  const buttonStyle = {
    padding: '10px 20px', backgroundColor: '#007bff', color: 'white', 
    border: 'none', borderRadius: '5px', cursor: 'pointer'
  };
  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Bem-vindo ao Nosso Site</h1>
      <button style={buttonStyle}>
        Começar
      </button>
    </div>
  );
}
`;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  console.log("API Recebeu o prompt:", prompt);

  // 1. Lê a chave secreta da OpenAI do ambiente
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Erro: Chave de API da OpenAI não encontrada.");
    return new Response('Chave de API da OpenAI não configurada.', { status: 500 });
  }

  // 2. Conecta-se à OpenAI usando a SDK
  const openai = createOpenAI({
    apiKey: apiKey,
  });

  try {
    const result = await streamText({
      // 3. Usa um modelo GPT (gpt-3.5-turbo é rápido e barato)
      model: openai('gpt-3.5-turbo'),
      system: systemPrompt,
      prompt: prompt,
      // Opcional: Adicionar limites para segurança e custo
      // maxTokens: 1000, 
    });

    console.log("Chamada para OpenAI bem-sucedida. Iniciando stream...");

    // 4. Retorna a resposta para o frontend
    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    // Adapta a mensagem de erro para TS entender 'error' como tipo 'any' ou 'Error'
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(`Erro ao chamar a API da OpenAI: ${errorMessage}`, { status: 500 });
  }
}

// Mantém a exportação vazia para compatibilidade com Vercel/Next.js
export {};
