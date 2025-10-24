"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  rootElement\n);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    // Estados para controlar o fluxo
    const [promptSubmitted, setPromptSubmitted] = useState<string | null>(null); // Guarda o prompt que foi enviado
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false); // Evita re-boot desnecessário

    // Hook da Vercel AI SDK
    const {
        input,
        setInput, // Adicionado para poder limpar o input se necessário
        handleInputChange,
        handleSubmit: handleTriggerCompletion,
        completion, // O código gerado pela IA (atualizado pela biblioteca)
        isLoading, // Flag de loading da API (true enquanto a IA processa)
        error,     // Erros da API
    } = useCompletion({
        api: "/api/generateApp",
        // Não precisamos mais de onFinish ou onError aqui
    });

    // Função chamada ao submeter o formulário
    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput) return; // Não envia se vazio

        setPromptSubmitted(currentInput); // Marca que um prompt foi enviado
        setIsBootingSandbox(false);
        hasBootedRef.current = false;
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = ""; // Limpa o sandbox anterior
        }
        // Chamamos a função do hook, passando o evento
        handleTriggerCompletion(e);
    };

    // useEffect principal: Reage quando 'completion' MUDA ou 'isLoading' MUDA.
    useEffect(() => {
        // Condição 1: A API terminou de carregar (isLoading == false) E NÓS tínhamos enviado um prompt (promptSubmitted != null)
        if (!isLoading && promptSubmitted) {
            console.log("Hook useCompletion não está mais carregando. Estado 'completion':", completion);

            // Condição 2: O código final ('completion') NÃO está vazio E ainda não iniciamos o boot para este prompt
            if (completion && completion.trim().length > 0 && !hasBootedRef.current) {
                console.log("Código válido recebido no estado 'completion'. Iniciando boot do sandbox...");
                setIsBootingSandbox(true);
                hasBootedRef.current = true; // Marca que iniciamos o boot
                bootSandbox(completion);
                setPromptSubmitted(null); // Reseta o estado de submissão APÓS o boot iniciar
            }
            // Condição 3: A API terminou, tínhamos enviado um prompt, mas o código final ('completion') ESTÁ vazio E não houve erro da API E não bootamos ainda
            else if ((!completion || completion.trim().length === 0) && !error && !hasBootedRef.current) {
                console.error("Erro detectado no useEffect: Código final vazio após submissão bem-sucedida.");
                alert("Erro: A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel. Pode ser um erro no prompt ou na IA.");
                hasBootedRef.current = true; // Marca como tratado
                setPromptSubmitted(null); // Reseta o estado de submissão
            }
            // Condição 4: Se houve um erro da API, apenas reseta o estado de submissão (o erro já foi tratado abaixo)
            else if (error && !hasBootedRef.current) {
                 hasBootedRef.current = true; // Marca como tratado para não entrar no if de código vazio
                 setPromptSubmitted(null); // Reseta o estado de submissão
            }
        }
    }, [isLoading, completion, promptSubmitted, error]); // Monitora estas variáveis

    // Função que inicia o sandbox (sem mudanças significativas)
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
             setIsBootingSandbox(false);
             setPromptSubmitted(null); // Reseta em caso de erro no boot
             alert(`Erro ao iniciar o ambiente de prototipagem: ${err.message}`);
        })
    };

    // Estado geral de loading (API OU Sandbox)
    const isOverallLoading = isLoading || isBootingSandbox;

    // Interface do Usuário (JSX)
    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isOverallLoading} // Desabilita se estiver carregando
                />
                <button type="submit" style={buttonStyle} disabled={isOverallLoading || !input.trim()}>
                    {isLoading ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

            {/* Mostra erro da API, se houver */}
             {error && (
                <div style={{ color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' }}>
                    <strong>Erro da API:</strong> {error.message}
                    <br/>
                    <small>(Verifique os logs do Vercel para mais detalhes)</small>
                </div>
             )}

            {/* Container do Sandbox */}
            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {/* Mensagem de Loading */}
                {isOverallLoading && (
                    <div style={loadingStyle}>
                        {isLoading ? "Aguarde... Gerando código com IA..." : "Iniciando servidor virtual e compilando..."}
                        <br/>
                        (Isso pode levar até 30 segundos)
                    </div>
                )}
                 {/* Mensagem Inicial */}
                {!isOverallLoading && (!sandboxRef.current || sandboxRef.current.innerHTML === "") && (
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
