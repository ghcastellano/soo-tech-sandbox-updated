"use client";

import React, { useState, useRef, useEffect } from "react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA PARA O TEMPLATE 'create-react-app' ---
const indexHtmlCRA = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>React App Prototype</title></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body></html>`;
const indexTsxCRA = `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './index.css';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(\n  document.getElementById('root') as HTMLElement\n);\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`;
const indexCssCRA = `body { margin: 0; font-family: sans-serif; background-color: #282c34; color: white; } #root { padding: 20px; }`;
const packageJsonCRA = `{ "name": "react-ts-cra-prototype", "version": "0.1.0", "private": true, "dependencies": { "@types/node": "^16.7.13", "@types/react": "^18.0.0", "@types/react-dom": "^18.0.0", "react": "^18.2.0", "react-dom": "^18.2.0", "react-scripts": "5.0.1", "typescript": "^4.4.2", "web-vitals": "^2.1.0" }, "scripts": { "start": "react-scripts start", "build": "react-scripts build", "test": "react-scripts test", "eject": "react-scripts eject" }, "eslintConfig": { "extends": ["react-app", "react-app/jest"] }, "browserslist": { "production": [">0.2%", "not dead", "not op_mini all"], "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"] } }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const latestCodeRef = useRef<string | null>(null);
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [isBootingSandbox, setIsBootingSandbox] = useState(false); // Reintroduzido
    const [error, setError] = useState<string | null>(null);
    const sandboxRef = useRef<HTMLDivElement>(null); // Reintroduzido
    const hasBootedRef = useRef(false);
    const [submissionTrigger, setSubmissionTrigger] = useState(0);

    // Função Fetch Manual (sem mudanças)
    const fetchGeneratedCode = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        latestCodeRef.current = null;
        hasBootedRef.current = false;
        if (sandboxRef.current) sandboxRef.current.innerHTML = "";
        console.log("Iniciando fetch para /api/generateApp com prompt:", prompt);
        try {
            // ... (código do fetch permanece o mesmo) ...
            const response = await fetch('/api/generateApp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
            console.log("Resposta da API recebida, status:", response.status);
            if (!response.ok) { const errorText = await response.text(); throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`); }
            if (!response.body) { throw new Error("Resposta da API vazia."); }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let codeAccumulator = "";
            console.log("Lendo stream...");
            while (true) { const { done, value } = await reader.read(); if (done) { console.log("Stream finalizada."); break; } codeAccumulator += decoder.decode(value, { stream: true }); }
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
        // Agora verifica isBootingSandbox também
        if (!currentInput || isLoadingAPI || isBootingSandbox) return;
        fetchGeneratedCode(currentInput);
    };

    // useEffect para iniciar o Sandbox
    useEffect(() => {
        if (submissionTrigger > 0 && !isLoadingAPI && !hasBootedRef.current) {
            hasBootedRef.current = true;
            const currentCode = latestCodeRef.current;
            console.log("useEffect pós-fetch ativado. Código na Ref:", currentCode);
            if (currentCode && currentCode.trim().length > 0) {
                 console.log("Código válido detectado. Iniciando boot do sandbox (embed)...");
                 setIsBootingSandbox(true); // Ativa loading do sandbox
                 bootSandbox(currentCode);
             } else if (!error) {
                 console.error("Erro: Código final vazio na Ref após fetch.");
                 setError("A IA respondeu, mas o código final está vazio.");
             }
        }
    }, [submissionTrigger, isLoadingAPI, error]);

    // Função bootSandbox (VOLTANDO A USAR embedProject com template CRA)
    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) {
            console.error("Referência do Sandbox não encontrada.");
            setIsLoadingAPI(false);
            setIsBootingSandbox(false);
            setError("Erro interno: Container do sandbox não encontrado.");
            return;
        };
        // Limpa o container antes de embedar
        sandboxRef.current.innerHTML = '';
        console.log("Chamando sdk.embedProject com template create-react-app...");

        sdk.embedProject(
            sandboxRef.current, // O elemento <div> onde o iframe vai entrar
            { // Configurações do Projeto
                title: "Protótipo Gerado pela Soo Tech",
                template: "create-react-app", // Template correto
                files: {
                    // Estrutura CRA
                    "public/index.html": indexHtmlCRA,
                    "src/index.tsx": indexTsxCRA,
                    "src/index.css": indexCssCRA,
                    "src/App.tsx": appCode,
                    "package.json": packageJsonCRA,
                },
            },
            { // Opções de Embed (para esconder a UI do StackBlitz)
                openFile: "src/App.tsx",
                view: "preview",
                height: 500,
                theme: "dark",
                hideExplorer: true,
                hideNavigation: true,
                hideDevTools: true,
                clickToLoad: false,
            }
        ).then(() => {
            console.log("Sandbox embedado com sucesso.");
            setIsBootingSandbox(false); // Desliga loading do sandbox
            // Não resetamos isLoadingAPI aqui
        }).catch((err) => {
             console.error("Erro ao embedar o StackBlitz:", err);
             setIsLoadingAPI(false); // Reseta ambos os loadings em caso de erro
             setIsBootingSandbox(false);
             setError(`Erro ao iniciar o ambiente embedado: ${err.message}`);
        });
    };

    // Estado geral de loading
    const isOverallLoading = isLoadingAPI || isBootingSandbox;

    // Interface (JSX - Com o container do sandbox de volta)
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
                    {/* Texto do botão reflete os dois loadings */}
                    {isLoadingAPI ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

            {/* Container onde o StackBlitz será embedado */}
            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {/* Mensagem de Loading unificada */}
                {isOverallLoading && (
                    <div style={loadingStyle}>
                        {isLoadingAPI ? "Aguarde... Gerando código com IA..." : "Iniciando sandbox e compilando..."}
                        <br/>(Isso pode levar mais tempo)
                    </div>
                )}
                {/* Mensagem Inicial */}
                {!isOverallLoading && (!sandboxRef.current || sandboxRef.current.innerHTML === "") && !error && (
                     <div style={loadingStyle}>Aguardando seu prompt...</div>
                )}
            </div>
        </div>
    )
}

// Estilos (mantidos)
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "100px", padding: "16px", background: "#151515", color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "8px" };
const sandboxContainerStyle: React.CSSProperties = { width: "100%", height: "500px", background: "#0A0A0A", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative' };
const loadingStyle: React.CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px", background: '#0A0A0A' };
const errorStyle: React.CSSProperties = { color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' };
