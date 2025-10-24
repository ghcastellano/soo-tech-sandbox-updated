"use client";

import React, { useState, useRef, useEffect } from "react";
// REMOVEMOS useCompletion daqui
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças aqui) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  rootElement\n);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState(""); // Estado manual para o input
    const [generatedCode, setGeneratedCode] = useState<string | null>(null); // Estado manual para o código
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false);

    // Função para chamar nossa API manualmente
    const fetchGeneratedCode = async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setGeneratedCode(null); // Limpa o código anterior
        hasBootedRef.current = false;
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = "";
        }

        try {
            const response = await fetch('/api/generateApp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            // Lidar com a stream de resposta
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Falha ao obter o leitor da stream.");
            }

            const decoder = new TextDecoder();
            let codeAccumulator = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                codeAccumulator += chunk;
                // Atualizamos o estado a cada chunk para ver o streaming (opcional)
                // setGeneratedCode(codeAccumulator); 
            }
             // Atualiza o estado final apenas quando a stream terminar
            setGeneratedCode(codeAccumulator);
             console.log("Stream da API finalizada. Código acumulado:", codeAccumulator);


        } catch (err: any) {
            console.error("Erro no fetch manual:", err);
            setError(err.message || "Erro desconhecido ao buscar código.");
        } finally {
            setIsLoading(false); // Marca que a API terminou (sucesso ou erro)
        }
    };

    // Função chamada ao submeter o formulário
    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoading) return; // Não envia se vazio ou carregando
        fetchGeneratedCode(currentInput);
    };

    // useEffect para iniciar o Sandbox QUANDO 'generatedCode' tiver valor E não estivermos mais carregando
    useEffect(() => {
        if (!isLoading && generatedCode !== null && !hasBootedRef.current) {
            if (generatedCode.trim().length > 0) {
                console.log("Código válido no estado 'generatedCode'. Iniciando boot do sandbox...");
                setIsBootingSandbox(true);
                hasBootedRef.current = true;
                bootSandbox(generatedCode);
            } else if (generatedCode.trim().length === 0 && !error) {
                 // Verifica se o prompt foi realmente enviado (input não vazio no submit)
                 // Evita falso positivo na carga inicial
                if(input !== "") { 
                    console.error("Erro detectado no useEffect: Código final vazio após fetch bem-sucedido.");
                    setError("A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel.");
                    hasBootedRef.current = true; // Marca como tratado
                }
            }
        }
    }, [isLoading, generatedCode, error, input]); // Adicionado 'input' para evitar alerta na carga inicial


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
                openFile: "App.tsx",
                view: "preview",
                height: 500,
                theme: "dark",
            }
        ).then(() => {
            setIsBootingSandbox(false);
        }).catch((err) => {
             console.error("Erro ao iniciar o StackBlitz:", err);
             setIsLoading(false); // Reseta loading geral
             setIsBootingSandbox(false);
             setError(`Erro ao iniciar o ambiente: ${err.message}`);
        })
    };

    // Estado geral de loading (API OU Sandbox)
    const isOverallLoading = isLoading || isBootingSandbox;

    // Interface (JSX)
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
                    {isLoading ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

             {/* Mostra erro, se houver */}
             {error && (
                <div style={{ color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' }}>
                    <strong>Erro:</strong> {error}
                </div>
             )}

            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {isOverallLoading && (
                    <div style={loadingStyle}>
                        {isLoading ? "Aguarde... Gerando código com IA..." : "Iniciando servidor virtual e compilando..."}
                        <br/>
                        (Isso pode levar até 30 segundos)
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
