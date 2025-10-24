"use client";

import React, { useState, useRef, useEffect } from "react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças aqui) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  rootElement\n);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    // Não vamos mais usar um estado para o código gerado, usaremos uma ref
    // const [generatedCode, setGeneratedCode] = useState<string | null>(null); 
    const latestCodeRef = useRef<string | null>(null); // Ref para guardar o código imediatamente
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false);
    const [submissionTrigger, setSubmissionTrigger] = useState(0); // Para re-acionar o useEffect

    // Função para chamar nossa API manualmente
    const fetchGeneratedCode = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        latestCodeRef.current = null; // Limpa a ref
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
            // ATUALIZA A REF DIRETAMENTE E SINCRONAMENTE
            latestCodeRef.current = codeAccumulator; 

        } catch (err: any) {
            console.error("Erro durante o fetch:", err);
            setError(err.message || "Erro desconhecido.");
        } finally {
            setIsLoadingAPI(false); // Finaliza o loading da API
            console.log("Fetch finalizado.");
            // Incrementa o trigger para re-rodar o useEffect
            setSubmissionTrigger(prev => prev + 1); 
        }
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI || isBootingSandbox) return;
        fetchGeneratedCode(currentInput);
    };

    // useEffect para iniciar o Sandbox
    // AGORA DEPENDE DO 'submissionTrigger' PARA RODAR APÓS O FETCH
    useEffect(() => {
        // Roda apenas se:
        // 1. O trigger foi atualizado (significa que o fetch acabou)
        // 2. Não estamos mais carregando a API
        // 3. Ainda não bootamos para esta submissão
        if (submissionTrigger > 0 && !isLoadingAPI && !hasBootedRef.current) {
            hasBootedRef.current = true; // Marca como iniciado/tratado

            // Lê o código diretamente da Ref (valor mais atualizado)
            const currentCode = latestCodeRef.current; 
            console.log("useEffect pós-fetch ativado. Código na Ref:", currentCode);

            if (currentCode && currentCode.trim().length > 0) {
                 console.log("Código válido detectado na Ref. Iniciando boot do sandbox...");
                 setIsBootingSandbox(true);
                 bootSandbox(currentCode);
             } else if (!error) { // Se não houve erro de fetch mas o código é vazio
                 console.error("Erro: Código final vazio na Ref após fetch bem-sucedido.");
                 setError("A IA respondeu, mas o código final está vazio.");
                 // Não precisa resetar isLoadingAPI aqui, pois já está false
             }
        }
    }, [submissionTrigger, isLoadingAPI, error]); // Removido 'generatedCode'


    // Função bootSandbox (sem mudanças)
    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return;
        sdk.embedProject(/*...*/).then(/*...*/).catch(/*...*/); // Mantenha o código da função bootSandbox igual
    
        // Cole o código completo da função bootSandbox da resposta anterior aqui
        sdk.embedProject(
            sandboxRef.current,
            {
                title: "Protótipo Gerado pela Soo Tech",
                template: "typescript",
                files: {
                    "index.html": indexHtml,
                    "index.ts": indexTsx,
                    "styles.css": stylesCss,
                    "App.tsx": appCode,
                },
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
        }).catch((err) => {
             console.error("Erro ao iniciar o StackBlitz:", err);
             setIsLoadingAPI(false); 
             setIsBootingSandbox(false);
             setError(`Erro ao iniciar o ambiente: ${err.message}`);
        });
    };

    // Estado geral de loading
    const isOverallLoading = isLoadingAPI || isBootingSandbox;

    // Interface (JSX)
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
                        {isLoadingAPI ? "Aguarde... Gerando código com IA..." : "Iniciando sandbox e compilando..."}
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

// Estilos (mantidos)
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "100px", padding: "16px", background: "#151515", color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "8px" };
const sandboxContainerStyle: React.CSSProperties = { width: "100%", height: "500px", background: "#0A0A0A", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative' };
const loadingStyle: React.CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px", background: '#0A0A0A' };
const errorStyle: React.CSSProperties = { color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' };
