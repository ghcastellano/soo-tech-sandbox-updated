"use client";

import React, { useState, useRef, useEffect } from "react";
import sdk from "@stackblitz/sdk";
// Não precisamos mais do useCompletion aqui
// import { useCompletion } from "@ai-sdk/react"; 

// --- ARQUIVOS DE SISTEMA PARA O TEMPLATE 'create-react-app' ---

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App Prototype</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!-- O CRA injeta o script aqui -->
  </body>
</html>
`;

// index.tsx agora dentro de src/
const indexTsx = `
import React from 'react';
import ReactDOM from 'react-dom/client'; // CRA usa createRoot
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

// CSS global simples dentro de src/
const indexCss = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #282c34; /* Cor de fundo padrão CRA escura */
  color: white;
}

#root {
    padding: 20px;
}
`;

// package.json específico para o template 'create-react-app'
const packageJson = `
{
  "name": "react-ts-cra-prototype",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.7.13",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.4.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false);

    // Função Fetch (sem mudanças aqui)
    const fetchGeneratedCode = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        setGeneratedCode(null);
        hasBootedRef.current = false;
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = "";
        }
        console.log("Iniciando fetch para /api/generateApp com prompt:", prompt);
        try {
            const response = await fetch('/api/generateApp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
            });
            console.log("Resposta da API recebida, status:", response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erro na resposta da API:", errorText);
                throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`);
            }
            if (!response.body) { throw new Error("Resposta da API não contém corpo (body)."); }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let codeAccumulator = "";
            console.log("Começando a ler a stream...");
            while (true) {
                const { done, value } = await reader.read();
                if (done) { console.log("Stream finalizada."); break; }
                const chunk = decoder.decode(value, { stream: true });
                codeAccumulator += chunk;
            }
            console.log("Código final acumulado:", codeAccumulator);
            setGeneratedCode(codeAccumulator);
        } catch (err: any) {
            console.error("Erro durante o fetch ou leitura da stream:", err);
            setError(err.message || "Erro desconhecido ao buscar código.");
        } finally {
            setIsLoadingAPI(false);
            console.log("Fetch finalizado.");
        }
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI || isBootingSandbox) return;
        fetchGeneratedCode(currentInput);
    };

    // useEffect para iniciar o Sandbox (sem mudanças aqui)
    useEffect(() => {
        if (!isLoadingAPI && generatedCode !== null && !hasBootedRef.current) {
             hasBootedRef.current = true;
             if (generatedCode.trim().length > 0) {
                 console.log("Código válido detectado. Iniciando boot do sandbox...");
                 setIsBootingSandbox(true);
                 bootSandbox(generatedCode);
             } else if (!error) {
                 console.error("Erro: Código final vazio após fetch bem-sucedido.");
                 setError("A IA respondeu, mas o código final está vazio.");
             }
        }
    }, [isLoadingAPI, generatedCode, error]); // Removido 'input' que era desnecessário aqui

    // Função bootSandbox (com template e estrutura de arquivos atualizados)
    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return;
        sdk.embedProject(
            sandboxRef.current,
            {
                title: "Protótipo Gerado pela Soo Tech",
                template: "create-react-app", // <-- TEMPLATE CORRETO
                files: {
                    // Estrutura de arquivos do Create React App
                    "public/index.html": indexHtml,
                    "src/index.tsx": indexTsx,   // Arquivo de entrada na pasta src
                    "src/index.css": indexCss,   // CSS na pasta src
                    "src/App.tsx": appCode,    // Código da IA na pasta src
                    "package.json": packageJson, // package.json na raiz
                },
                // Não precisamos de 'dependencies' aqui, o template CRA cuida disso
            },
            {
                openFile: "src/App.tsx", // Abre o código da IA
                view: "preview",
                height: 500,
                theme: "dark",
            }
        ).then(() => {
            console.log("Sandbox iniciado com sucesso.");
            setIsBootingSandbox(false);
        }).catch((err) => {
             console.error("Erro ao iniciar o StackBlitz:", err);
             setIsLoadingAPI(false); // Garante reset
             setIsBootingSandbox(false);
             setError(`Erro ao iniciar o ambiente: ${err.message}`);
        });
    };

    const isOverallLoading = isLoadingAPI || isBootingSandbox;

    // Interface (JSX - sem mudanças significativas)
    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isOverallLoading}
                />
                <button type="submit" style={buttonStyle} disabled={isOverallLoading || !input.trim()}>
                    {isLoadingAPI ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {isOverallLoading && (
                    <div style={loadingStyle}>
                        {isLoadingAPI ? "Aguarde... Gerando código com IA..." : "Iniciando sandbox e instalando dependências..."}
                        <br/>(Isso pode levar mais tempo)
                    </div>
                )}
                {!isOverallLoading && (!sandboxRef.current || sandboxRef.current.innerHTML === "") && !error && (
                     <div style={loadingStyle}>Aguardando seu prompt...</div>
                )}
            </div>
        </div>
    )
}

// Estilos (mantidos - copie da sua versão anterior ou deixe como está)
const textAreaStyle: React.CSSProperties = { /*...*/ };
const buttonStyle: React.CSSProperties = { /*...*/ };
const sandboxContainerStyle: React.CSSProperties = { /*...*/ };
const loadingStyle: React.CSSProperties = { /*...*/ };
const errorStyle: React.CSSProperties = { /*...*/ };
Object.assign(textAreaStyle, { width: "100%", minHeight: "100px", padding: "16px", background: "#151515", color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box" });
Object.assign(buttonStyle, { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "8px" });
Object.assign(sandboxContainerStyle, { width: "100%", height: "500px", background: "#0A0A0A", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative' });
Object.assign(loadingStyle, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px", background: '#0A0A0A' });
Object.assign(errorStyle, { color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' });
