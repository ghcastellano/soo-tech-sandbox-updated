"use client";

import React, { useState, useRef, useEffect } from "react"; // Adicionado useEffect
import { useCompletion } from "@ai-sdk/react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças aqui) ---
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Prototype</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="index.ts"></script>
  </body>
</html>
`;
const indexTsx = `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
`;
const stylesCss = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #1e1e1e;
  color: white;
  margin: 0;
  padding: 0;
}
#root {
  padding: 1rem;
}
`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [isLoadingCompletion, setIsLoadingCompletion] = useState(false); // Renomeado para evitar conflito
    const [isBootingSandbox, setIsBootingSandbox] = useState(false); // Estado para loading do sandbox
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false); // Para garantir que o boot ocorra apenas uma vez por resposta

    const {
        input,
        handleInputChange,
        handleSubmit: handleTriggerCompletion, // Renomeado para clareza
        completion,
        isLoading: isLoadingCompletionHook, // Renomeado para evitar conflito
        error, // Vamos usar o estado de erro do hook
    } = useCompletion({
        api: "/api/generateApp",
        // NÃO usaremos mais onFinish ou onError aqui para o boot
    });

    // Atualiza nosso estado de loading baseado no hook
    useEffect(() => {
        setIsLoadingCompletion(isLoadingCompletionHook);
        if (isLoadingCompletionHook) {
            hasBootedRef.current = false; // Reseta o flag de boot quando uma nova requisição começa
        }
    }, [isLoadingCompletionHook]);

    // O useEffect que vai iniciar o Sandbox QUANDO a requisição terminar E tivermos código
    useEffect(() => {
        // Condições: Não está mais carregando da API, temos código no 'completion', e ainda não iniciamos o boot
        if (!isLoadingCompletion && completion && completion.trim().length > 0 && !hasBootedRef.current) {
            console.log("Completion finalizado, iniciando boot do sandbox com o código:", completion);
            setIsBootingSandbox(true); // Ativa o loading específico do sandbox
            hasBootedRef.current = true; // Marca que o boot foi iniciado para esta resposta
            bootSandbox(completion);
        } else if (!isLoadingCompletion && completion === "" && !hasBootedRef.current && input) {
            // Caso especial: A API terminou, mas retornou vazio (após o input ter sido enviado)
             if (!isLoadingCompletionHook && !hasBootedRef.current && input !== "") { // Verifica se já houve input
                 console.error("Erro detectado no useEffect: Código final vazio após conclusão.");
                 setIsLoadingCompletion(false);
                 setIsBootingSandbox(false);
                 alert("Erro: A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel. Pode ser um erro no prompt ou na IA.");
             }
        }
    }, [isLoadingCompletion, completion, input]); // Depende do loading e do completion


    // Função que "inicia" o sandbox do StackBlitz (sem mudanças aqui)
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
            setIsBootingSandbox(false); // Desativa o loading do sandbox quando termina
        }).catch((err) => {
             console.error("Erro ao iniciar o StackBlitz:", err);
             setIsLoadingCompletion(false);
             setIsBootingSandbox(false);
             alert(`Erro ao iniciar o ambiente de prototipagem: ${err.message}`);
        })
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoadingCompletion(true); // Ativa o loading da API
        setIsBootingSandbox(false); // Garante que o loading do sandbox esteja desligado
        hasBootedRef.current = false; // Permite um novo boot
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = ""; // Limpa o sandbox anterior
        }
        handleTriggerCompletion(e); // Chama a API
    };

    // Define o estado geral de loading
    const isLoading = isLoadingCompletion || isBootingSandbox;

    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isLoading}
                />
                <button type="submit" style={buttonStyle} disabled={isLoading}>
                    {isLoading ? (isLoadingCompletion ? "Gerando Código..." : "Compilando Protótipo...") : "Gerar Protótipo ao Vivo"}
                </button>
            </form>

            {/* Mostra erro da API se houver */}
             {error && (
                <div style={{ color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                    Erro da API: {error.message}
                </div>
             )}

            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {/* Mensagem de Loading mais detalhada */}
                {isLoading && (
                    <div style={loadingStyle}>
                        {isLoadingCompletion ? "Aguarde... Gerando código com IA..." : "Iniciando servidor virtual e compilando..."}
                        <br/>
                        (Isso pode levar até 30 segundos)
                    </div>
                )}
                 {/* Mensagem inicial */}
                {!isLoading && !completion && !error && (
                     <div style={loadingStyle}>Aguardando seu prompt...</div>
                )}
            </div>
        </div>
    )
}

// Estilos (mantidos - copie da sua versão anterior)
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
    border: "1px solid #333", borderRadius: "8px", overflow: "hidden",
};
const loadingStyle: React.CSSProperties = {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "#888", fontSize: "14px",
};
