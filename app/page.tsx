"use client";

import React, { useState, useRef, useEffect } from "react";
import sdk from "@stackblitz/sdk"; // Apenas o SDK é necessário

// --- ARQUIVOS DE SISTEMA (Sem mudanças) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(<App />, rootElement);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const latestCodeRef = useRef<string | null>(null);
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    // Não precisamos mais do estado isBootingSandbox
    const [error, setError] = useState<string | null>(null);
    // Não precisamos mais da ref do sandbox
    // const sandboxRef = useRef<HTMLDivElement>(null);
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
        if (!currentInput || isLoadingAPI) return; // Removido isBootingSandbox
        fetchGeneratedCode(currentInput);
    };

    // useEffect para ABRIR o Sandbox
    useEffect(() => {
        // Roda APENAS se o fetch terminou E o trigger foi incrementado
        if (submissionTrigger > 0 && !isLoadingAPI) {
            const currentCode = latestCodeRef.current;
            console.log("useEffect pós-fetch ativado. Código na Ref:", currentCode);

            if (currentCode && currentCode.trim().length > 0) {
                 console.log("Código válido detectado na Ref. Abrindo projeto no StackBlitz...");
                 openSandbox(currentCode); // Chama a função para ABRIR
             } else if (!error) {
                 console.error("Erro: Código final vazio na Ref após fetch bem-sucedido.");
                 setError("A IA respondeu, mas o código final está vazio.");
             }
            // Não precisamos mais de hasBootedRef ou setIsBootingSandbox
        }
    }, [submissionTrigger, isLoadingAPI, error]); // Dependências corretas

    // Função openSandbox (NOVA FUNÇÃO usando sdk.openProject)
    const openSandbox = (appCode: string) => {
        console.log("Chamando sdk.openProject...");
        try {
            sdk.openProject(
                {
                    title: "Protótipo Gerado pela Soo Tech",
                    template: "typescript", // Mantemos typescript, pois funcionou com o boilerplate
                    files: {
                        "index.html": indexHtml,
                        "index.ts": indexTsx,
                        "styles.css": stylesCss,
                        "App.tsx": appCode, // Código da IA
                    },
                },
                {
                    // Opções para abrir em nova aba
                    newWindow: true,
                    openFile: "App.tsx",
                }
            );
            console.log("sdk.openProject chamado com sucesso (nova aba deve abrir).");
        } catch (err: any) {
            console.error("Erro ao chamar sdk.openProject:", err);
            setError(`Erro ao tentar abrir o ambiente: ${err.message}`);
        }
    };

    // Estado geral de loading (APENAS API)
    const isOverallLoading = isLoadingAPI;

    // Interface (JSX - Simplificada, sem container do sandbox)
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
                    {/* Texto do botão simplificado */}
                    {isOverallLoading ? "Gerando Código..." : "Gerar Protótipo (Nova Aba)"}
                </button>
            </form>

             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

             {/* REMOVEMOS o <div> do sandboxRef */}

             {/* Adiciona uma mensagem indicando que abrirá em nova aba */}
             {!isOverallLoading && !error && (
                 <div style={{...loadingStyle, position: 'static', height: 'auto', marginTop: '20px'}}>
                     O protótipo será aberto em uma nova aba do navegador.
                 </div>
             )}
        </div>
    )
}

// Estilos (mantidos)
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "100px", padding: "16px", background: "#151515", color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "8px" };
// const sandboxContainerStyle: React.CSSProperties = { /* ... Não é mais necessário ... */ };
const loadingStyle: React.CSSProperties = { /* position, top, left etc removidos */ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px" };
const errorStyle: React.CSSProperties = { color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' };
