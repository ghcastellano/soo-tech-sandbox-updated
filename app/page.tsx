"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  rootElement\n);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

// --- PACOTE JSON PARA O SANDBOX (Vite + React + TS) ---
const packageJson = `
{
  "name": "react-ts-prototype",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5" 
  }
}
`;
// --- FIM DO PACOTE JSON ---


export default function LiveSandbox() {
    const [isLoading, setIsLoading] = useState(false);
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false);
    const [promptSubmitted, setPromptSubmitted] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        input,
        setInput,
        handleInputChange,
        handleSubmit: handleTriggerCompletion,
        completion,
        isLoading: isLoadingCompletionHook,
    } = useCompletion({
        api: "/api/generateApp",
        onError: (err) => {
             console.error("Erro recebido do hook useCompletion:", err);
             setError(`Erro ao gerar código: ${err.message}`);
             setIsLoading(false);
             setPromptSubmitted(null);
        }
    });

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoading) return;

        setPromptSubmitted(currentInput);
        setIsLoading(true);
        setIsBootingSandbox(false);
        setError(null);
        hasBootedRef.current = false;
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = "";
        }
        handleTriggerCompletion(e);
    };

    useEffect(() => {
        if (!isLoadingCompletionHook && promptSubmitted) {
            console.log("Hook useCompletion finalizou. Estado 'completion':", completion);
            if (completion && completion.trim().length > 0 && !hasBootedRef.current) {
                console.log("Código válido recebido. Iniciando boot do sandbox...");
                setIsBootingSandbox(true);
                hasBootedRef.current = true;
                bootSandbox(completion);
            } else if ((!completion || completion.trim().length === 0) && !error && !hasBootedRef.current) {
                console.error("Erro: Código final vazio após submissão bem-sucedida.");
                setError("A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel.");
                hasBootedRef.current = true;
                setIsLoading(false);
                setPromptSubmitted(null);
            } else if (error && !hasBootedRef.current) {
                 hasBootedRef.current = true;
                 setPromptSubmitted(null);
            }
        }
    }, [isLoadingCompletionHook, completion, promptSubmitted, error]);

    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return;
        sandboxRef.current.innerHTML = '';

        sdk.embedProject(
            sandboxRef.current,
            {
                title: "Protótipo Gerado pela Soo Tech",
                template: "node", // Usamos node para ele ler o package.json
                files: {
                    "package.json": packageJson, // Define como rodar (npm run dev -> vite)
                    "index.html": indexHtml,     // Ponto de entrada do Vite
                    "index.ts": indexTsx,        // Script principal
                    "styles.css": stylesCss,
                    "App.tsx": appCode,          // Código da IA
                },
                dependencies: { // Define dependências explícitas
                   "react": "^18.2.0",
                   "react-dom": "^18.2.0"
                },
                // REMOVEMOS o bloco 'settings' daqui
            },
            {
                openFile: "App.tsx",
                view: "preview",
                height: 500,
                theme: "dark",
            }
        ).then(() => {
            console.log("Sandbox iniciado com sucesso.");
            setIsBootingSandbox(false);
            setIsLoading(false);
            setPromptSubmitted(null);
        }).catch((err) => {
             console.error("Erro ao iniciar o StackBlitz:", err);
             setIsLoading(false);
             setIsBootingSandbox(false);
             setError(`Erro ao iniciar o ambiente: ${err.message}`);
             setPromptSubmitted(null);
        });
    };

    const isOverallLoading = isLoading || isBootingSandbox;

    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isOverallLoading}
                />
                <button type="submit" style={buttonStyle} disabled={isOverallLoading || !input.trim()}>
                    {isLoading ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

             {error && (
                <div style={{ color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' }}>
                    <strong>Erro:</strong> {error}
                </div>
             )}

            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {isOverallLoading && (
                    <div style={loadingStyle}>
                        {isLoading ? "Aguarde... Gerando código com IA..." : "Iniciando sandbox e instalando dependências..."}
                        <br/>
                        (Isso pode levar mais tempo na primeira vez)
                    </div>
                )}
                {!isOverallLoading && (!sandboxRef.current || sandboxRef.current.innerHTML === "") && !error && (
                     <div style={loadingStyle}>Aguardando seu prompt...</div>
                )}
            </div>
        </div>
    )
}

// Estilos
const textAreaStyle: React.CSSProperties = {
    width: "100%", minHeight: "100px", padding: "16px", background: "#151515",
    color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px",
    fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box",
};
const buttonStyle: React.CSSProperties = {
    width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontSize: "16px", fontWeight: "bold", marginTop: "8px",
};
const sandboxContainerStyle: React.CSSProperties = {
    width: "100%", height: "500px", background: "#0A0A0A",
    border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative'
};
const loadingStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "#888", fontSize: "14px", background: '#0A0A0A'
};
