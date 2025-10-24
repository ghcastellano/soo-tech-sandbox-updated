"use client";

import React, { useState, useRef, useEffect } from "react";
// Importamos SOMENTE o useInputChange do ai/react (ou nem isso, podemos controlar manualmente)
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças aqui) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  rootElement\n);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    // Estados Manuais
    const [input, setInput] = useState(""); // Estado para o textarea
    const [generatedCode, setGeneratedCode] = useState<string | null>(null); // Estado para guardar o código da API
    const [isLoadingAPI, setIsLoadingAPI] = useState(false); // Loading específico da API
    const [isBootingSandbox, setIsBootingSandbox] = useState(false); // Loading do StackBlitz
    const [error, setError] = useState<string | null>(null); // Mensagens de erro
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false); // Controle para boot único

    // Função para chamar a API manualmente
    const fetchGeneratedCode = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        setGeneratedCode(null);
        hasBootedRef.current = false;
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = ""; // Limpa sandbox antigo
        }

        console.log("Iniciando fetch para /api/generateApp com prompt:", prompt);

        try {
            const response = await fetch('/api/generateApp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            console.log("Resposta da API recebida, status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erro na resposta da API:", errorText);
                throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`);
            }

            if (!response.body) {
                 throw new Error("Resposta da API não contém corpo (body).");
            }

            // Ler a stream de texto
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let codeAccumulator = "";
            console.log("Começando a ler a stream...");

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("Stream finalizada.");
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                codeAccumulator += chunk;
                // console.log("Chunk recebido:", chunk); // Descomente para debug super detalhado
            }

            console.log("Código final acumulado:", codeAccumulator);
            setGeneratedCode(codeAccumulator); // Define o estado com o código completo

        } catch (err: any) {
            console.error("Erro durante o fetch ou leitura da stream:", err);
            setError(err.message || "Erro desconhecido ao buscar código.");
        } finally {
            setIsLoadingAPI(false); // Finaliza o loading da API
            console.log("Fetch finalizado (com sucesso ou erro).");
        }
    };

    // Função para lidar com o submit do formulário
    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI || isBootingSandbox) return;
        fetchGeneratedCode(currentInput);
    };

    // useEffect para iniciar o Sandbox QUANDO 'generatedCode' for preenchido (e não nulo)
    useEffect(() => {
        // Roda apenas se:
        // 1. A API NÃO estiver carregando (isLoadingAPI == false)
        // 2. O código gerado NÃO for nulo (generatedCode !== null)
        // 3. Ainda não tivermos iniciado o boot para esta resposta (hasBootedRef.current === false)
        if (!isLoadingAPI && generatedCode !== null && !hasBootedRef.current) {
             hasBootedRef.current = true; // Marca imediatamente para evitar re-execução

             if (generatedCode.trim().length > 0) {
                 console.log("Código válido detectado no estado 'generatedCode'. Iniciando boot do sandbox...");
                 setIsBootingSandbox(true);
                 bootSandbox(generatedCode);
             } else {
                 console.error("Erro detectado no useEffect: Código final vazio após fetch bem-sucedido.");
                 setError("A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel.");
                 // Não precisa resetar isLoadingAPI aqui, pois já está false
             }
        }
    }, [isLoadingAPI, generatedCode]); // Depende APENAS destes dois

    // Função que inicia o sandbox (sem mudanças)
    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return;
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
                openFile: "App.tsx", view: "preview", height: 500, theme: "dark",
            }
        ).then(() => {
            console.log("Sandbox iniciado com sucesso.");
            setIsBootingSandbox(false);
        }).catch((err) => {
             console.error("Erro ao iniciar o StackBlitz:", err);
             setIsBootingSandbox(false);
             setError(`Erro ao iniciar o ambiente: ${err.message}`);
        })
    };

    // Estado geral de loading
    const isOverallLoading = isLoadingAPI || isBootingSandbox;

    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)} // Atualiza estado manual
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isOverallLoading}
                />
                <button type="submit" style={buttonStyle} disabled={isOverallLoading || !input.trim()}>
                    {isLoadingAPI ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

             {error && (
                <div style={errorStyle}>
                    <strong>Erro:</strong> {error}
                </div>
             )}

            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {isOverallLoading && (
                    <div style={loadingStyle}>
                        {isLoadingAPI ? "Aguarde... Gerando código com IA..." : "Iniciando sandbox e instalando dependências..."}
                        <br/>
                        (Isso pode levar mais tempo)
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
const textAreaStyle: React.CSSProperties = { /*...*/ };
const buttonStyle: React.CSSProperties = { /*...*/ };
const sandboxContainerStyle: React.CSSProperties = { /*...*/ };
const loadingStyle: React.CSSProperties = { /*...*/ };
const errorStyle: React.CSSProperties = { /*...*/ };

// Cola aqui os estilos definidos anteriormente
Object.assign(textAreaStyle, {
    width: "100%", minHeight: "100px", padding: "16px", background: "#151515",
    color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px",
    fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box",
});
Object.assign(buttonStyle, {
    width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontSize: "16px", fontWeight: "bold", marginTop: "8px",
});
Object.assign(sandboxContainerStyle, {
    width: "100%", height: "500px", background: "#0A0A0A",
    border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative'
});
Object.assign(loadingStyle, {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "#888", fontSize: "14px", background: '#0A0A0A'
});
Object.assign(errorStyle, {
     color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000'
});
