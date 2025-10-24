// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// --- NOVO MASTER PROMPT ---
// Mais detalhado para guiar a IA para um resultado melhor
const systemPrompt = `
Você é um desenvolvedor frontend React experiente. Sua tarefa é gerar o código-fonte COMPLETO e AUTÔNOMO para um único componente React chamado 'App.tsx' baseado na descrição do usuário.

REGRAS ESSENCIAIS:
1.  **Tecnologia:** Use React e TypeScript.
2.  **Estilização:** Use **APENAS estilos inline (inline styles)**. NÃO use CSS externo, CSS Modules ou Tailwind. Crie objetos de estilo JavaScript para clareza.
3.  **Layout:** Tente usar Flexbox para criar layouts responsivos básicos quando apropriado.
4.  **Autonomia:** O código deve funcionar sozinho. NÃO inclua imports de arquivos que não existem, placeholders como "// Adicione sua lógica aqui", ou dependências externas não padrão do React.
5.  **SAÍDA PURA:** Responda **APENAS** com o código-fonte do componente 'App.tsx'. Nenhuma outra palavra, explicação, markdown (como \`\`\`), ou comandos.

Exemplo de Pedido: "uma landing page simples com título, parágrafo e botão"
Sua Resposta (e NADA MAIS):
import React from 'react';

export default function App() {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#282c34', // Fundo escuro
    color: 'white',
    padding: '40px',
    textAlign: 'center'
  };
  const titleStyle: React.CSSProperties = {
    fontSize: 'calc(10px + 2vmin)', // Tamanho responsivo
    marginBottom: '20px'
  };
  const paragraphStyle: React.CSSProperties = {
     marginBottom: '30px',
     maxWidth: '600px',
     lineHeight: '1.6'
  };
  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '1rem',
    backgroundColor: '#61dafb', // Azul React
    color: '#282c34',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Bem-vindo ao Protótipo</h1>
      <p style={paragraphStyle}>Este é um exemplo simples gerado por IA.</p>
      <button style={buttonStyle} onClick={() => alert('Clicou!')}>
        Clique Aqui
      </button>
    </div>
  );
}
`;
// --- FIM DO NOVO MASTER PROMPT ---

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log("API Recebeu o prompt:", prompt);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave de API da OpenAI não encontrada.");
    return new Response('Chave de API da OpenAI não configurada.', { status: 500 });
  }

  const openai = createOpenAI({ apiKey: apiKey });

  try {
    const result = await streamText({
      // --- MUDANÇA DE MODELO (Escolha UM): ---
      // model: openai('gpt-3.5-turbo'),     // Rápido e Barato (Qualidade Básica)
      model: openai('gpt-4o-mini'),       // Bom Equilíbrio (Recomendado para começar)
      // model: openai('gpt-4o'),           // Melhor Qualidade (Custo Maior)
      // ------------------------------------
      system: systemPrompt,
      prompt: prompt,
    });
    console.log("Chamada para OpenAI bem-sucedida. Iniciando stream...");
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(`Erro ao chamar a API da OpenAI: ${errorMessage}`, { status: 500 });
  }
}

export {};
