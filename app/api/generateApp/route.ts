// Caminho: app/api/generateApp/route.ts

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// --- NOVO MASTER PROMPT: Gerar HTML Autônomo ---
const systemPrompt = `
Você é um desenvolvedor frontend experiente. Sua tarefa é gerar o código-fonte COMPLETO e AUTÔNOMO para um **arquivo HTML único** que represente um protótipo visualmente atraente e funcional baseado na descrição do usuário.

REGRAS CRÍTICAS:
1.  **Formato:** Gere um documento HTML5 completo, começando com <!DOCTYPE html> e terminando com </html>.
2.  **Estilização:** Use CSS. Preferencialmente, inclua o CSS dentro de uma tag <style> no <head> do HTML. Estilos inline são aceitáveis para ajustes finos. Crie layouts limpos, modernos e responsivos (use Flexbox/Grid). Use cores harmoniosas (tons escuros são bem-vindos).
3.  **Interatividade:** Se o prompt sugerir interação (formulários, botões), use JavaScript vanilla (puro) dentro de tags <script> no final do <body> para adicionar a funcionalidade básica (ex: exibir mensagens, validação simples). Não use frameworks (React, Vue, etc.).
4.  **Autonomia:** O arquivo HTML DEVE funcionar sozinho. NÃO inclua links para arquivos CSS ou JS externos. NÃO inclua placeholders de lógica complexa.
5.  **SAÍDA ESTRITAMENTE DE CÓDIGO HTML:** Sua resposta deve conter **APENAS** o código-fonte HTML completo. Não inclua NENHUMA palavra antes ou depois, nenhuma explicação, nenhum comentário fora do código, e NENHUM markdown (como \`\`\`).

Exemplo de Pedido: "uma landing page simples com título, parágrafo e um botão que mostra um alerta ao clicar"
Sua Resposta (e NADA MAIS):
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Protótipo AI</title>
    <style>
        body {
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #282c34;
            color: white;
            padding: 40px;
            text-align: center;
            margin: 0;
        }
        h1 {
            font-size: calc(10px + 2vmin);
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 30px;
            max-width: 600px;
            line-height: 1.6;
        }
        button {
            padding: 12px 24px;
            font-size: 1rem;
            background-color: #61dafb;
            color: #282c34;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        button:hover {
            background-color: #4fa8c6;
        }
    </style>
</head>
<body>
    <h1>Bem-vindo ao Protótipo</h1>
    <p>Este é um exemplo simples gerado por IA usando HTML, CSS e JS.</p>
    <button id="meuBotao">Clique Aqui</button>

    <script>
        const botao = document.getElementById('meuBotao');
        botao.addEventListener('click', () => {
            alert('Botão clicado!');
        });
    </script>
</body>
</html>
`;
// --- FIM DO NOVO MASTER PROMPT ---

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log("API Recebeu o prompt para HTML:", prompt);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Erro: Chave de API da OpenAI não encontrada.");
    return new Response('Chave de API da OpenAI não configurada.', { status: 500 });
  }

  const openai = createOpenAI({ apiKey: apiKey });

  try {
    const result = await streamText({
      model: openai('gpt-4o-mini'), // Mantendo um modelo capaz
      system: systemPrompt,
      prompt: prompt,
      // maxTokens: 2000, // Pode precisar ajustar se o HTML ficar muito grande
    });
    console.log("Chamada para OpenAI (HTML) bem-sucedida. Iniciando stream...");
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI para HTML:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(`Erro ao chamar a API da OpenAI: ${errorMessage}`, { status: 500 });
  }
}

export {};
