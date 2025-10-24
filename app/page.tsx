"use client";

import React, { useState, useRef, useEffect } from "react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA PARA O TEMPLATE 'create-react-app' ---
// (Estes são os mesmos de antes, corretos para CRA)
const indexHtmlCRA = `
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
  </body>
</html>
`;

const indexTsxCRA = `
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

const indexCssCRA = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #282c34;
  color: white;
}
#root { padding: 20px; }
code { font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace; }
`;

const packageJsonCRA = `
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
    "typescript": "^4.4.2",
    "web-vitals": "^2.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": { "extends": ["react-app", "react-app/jest"] },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const latestCodeRef = useRef<string | null>(null);
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionTrigger, setSubmissionTrigger] = useState(0);

    // Função Fetch Manual (sem mudanças)
    const fetchGeneratedCode = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        latestCodeRef.current = null;
        console.log("Iniciando fetch para /api/generateApp com prompt:", prompt);
        try {
            const response = await fetch('/api/generateApp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
            });
            console.log("Resposta da API recebida, status:", response.status);
            if (!response.ok) {
                const errorText = await response.text(); throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`);
            }
            if (!response.body) { throw new Error("Resposta da API vazia."); }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let codeAccumulator = "";
            console.log("Lendo stream...");
            while (true) {
                const { done, value } = await reader.read();
                if (done) { console.log("Stream finalizada."); break; }
                codeAccumulator += decoder.decode(value, { stream: true });
            }
            console.log("Código final acumulado:", codeAccumulator);
            latestCodeRef.current = codeAccumulator;
        } catch (err: any) {
            console.error("Erro durante o fetch:", err);
            setError(err.message || "Erro desconhecido.");
        } finally {
            setIsLoadingAPI(false);
            console.log("Fetch finalizado.");
            setSubmissionTrigger(prev => prev + 1);
        }
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI) return;
        fetchGeneratedCode(currentInput);
    };

    // useEffect para ABRIR o Sandbox
    useEffect(() => {
        if (submissionTrigger > 0 && !isLoadingAPI) {
            const currentCode = latestCodeRef.current;
            console.log("useEffect pós-fetch ativado. Código na Ref:", currentCode);

            if (currentCode && currentCode.trim().length > 0) {
                 console.log("Código válido detectado na Ref. Abrindo projeto no StackBlitz...");
                 openSandbox(currentCode);
             } else if (!error) {
                 console.error("Erro: Código final vazio na Ref após fetch bem-sucedido.");
                 setError("A IA respondeu, mas o código final está vazio.");
             }
        }
    }, [submissionTrigger, isLoadingAPI, error]);

    // Função openSandbox (usando template 'create-react-app' e estrutura CRA)
    const openSandbox = (appCode: string) => {
        console.log("Chamando sdk.openProject com template create-react-app...");
        try {
            sdk.openProject(
                {
                    title: "Protótipo Gerado pela Soo Tech",
                    template: "create-react-app", // <-- TEMPLATE CORRETO PARA REACT+TS+JSX
                    files: {
                        // Estrutura de arquivos esperada pelo CRA template
                        "public/index.html": indexHtmlCRA,
                        "src/index.tsx": indexTsxCRA,
                        "src/index.css": indexCssCRA,
                        "src/App.tsx": appCode,      // Código da IA vai para src/
                        "package.json": packageJsonCRA, // package.json específico do CRA
                    },
                },
                {
                    newWindow: true,
                    openFile: "src/App.tsx", // Abre o arquivo principal na pasta src
                }
            );
            console.log("sdk.openProject chamado com sucesso.");
        } catch (err: any) {
            console.error("Erro ao chamar sdk.openProject:", err);
            setError(`Erro ao tentar abrir o ambiente: ${err.message}`);
        }
    };

    // Interface (JSX - sem mudanças)
    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isLoadingAPI}
                />
                <button type="submit" style={buttonStyle} disabled={isLoadingAPI || !input.trim()}>
                    {isLoadingAPI ? "Gerando Código..." : "Gerar Protótipo (Nova Aba)"}
                </button>
            </form>

             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

             {!isLoadingAPI && !error && (
                 <div style={{...loadingStyle, position: 'static', height: 'auto', marginTop: '20px'}}>
                     O protótipo será aberto em uma nova aba.
                 </div>
             )}
        </div>
    )
}

// Estilos
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "100px", padding: "16px", background: "#151515", color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "8px" };
const loadingStyle: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px" };
const errorStyle: React.CSSProperties = { color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' };
