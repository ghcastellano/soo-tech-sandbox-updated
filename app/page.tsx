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
  background-color: #1e1e1e; /* Fundo escuro para o sandbox */
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
    const [isSubmitting, setIsSubmitting] = useState(false); // NOVO ESTADO: Controla se enviamos o form
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false); // Para garantir um boot por submissão

    const {
        input,
        handleInputChange,
        handleSubmit: handleTriggerCompletion, // Função que chama a API
        completion,                             // O código gerado (string)
        isLoading: isLoadingCompletionHook,      // Boolean: A API está processando?
        error,                                  // Objeto de erro da API
    } = useCompletion({
        api: "/api/generateApp",
        // Removemos onFinish e onError daqui, vamos controlar com useEffect
    });

    // Função chamada ao submeter o formulário
    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim()) return; // Não envia se o input estiver vazio

        setIsSubmitting(true);       // Marca que começamos a submissão
        setIsBootingSandbox(false);    // Garante que o estado de boot esteja resetado
        hasBootedRef.current = false; // Permite um novo boot
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = ""; // Limpa o sandbox anterior
        }
        handleTriggerCompletion(e);     // Chama a API
    };

    // useEffect para lidar com o FIM da requisição da API
    useEffect(() => {
        // Roda apenas se:
        // 1. Nós tínhamos submetido o formulário (isSubmitting === true)
        // 2. A biblioteca 'ai' diz que não está mais carregando (isLoadingCompletionHook === false)
        if (isSubmitting && !isLoadingCompletionHook) {
            console.log("Hook useCompletion finalizou. Estado 'completion':", completion);

            // Verifica se recebemos algum código E se ainda não bootamos o sandbox para esta resposta
            if (completion && completion.trim().length > 0 && !hasBootedRef.current) {
                console.log("Código válido recebido. Iniciando boot do sandbox...");
                setIsBootingSandbox(true);   // Ativa o loading do sandbox
                hasBootedRef.current = true; // Marca que já iniciamos o boot
                bootSandbox(completion);
            }
            // Verifica se a API terminou mas retornou vazio (e não foi um erro de rede capturado pelo 'error' state)
            else if ((!completion || completion.trim().length === 0) && !error && !hasBootedRef.current) {
                console.error("Erro detectado no useEffect: Código final vazio após submissão bem-sucedida (sem erro de API).");
                alert("Erro: A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel. Pode ser um erro no prompt ou na IA.");
                hasBootedRef.current = true; // Marca como tratado para não repetir o alerta
            }
            // Importante: Resetar o estado de submissão APÓS processar o resultado (sucesso, vazio ou erro abaixo)
            setIsSubmitting(false);
        }
    }, [isSubmitting, isLoadingCompletionHook, completion, error]); // Adicionado 'error' às dependências

    // useEffect separado para lidar com erros de API reportados pelo hook
    useEffect(() => {
        if (error) {
            console.error("Erro recebido do hook useCompletion:", error);
            setIsSubmitting(false); // Garante que resetamos o estado de submissão
            setIsBootingSandbox(false);
            alert(`Erro ao comunicar com a IA: ${error.message}. Verifique o console e os logs do Vercel.`);
            // Marcamos como "booted" para evitar que o outro useEffect dispare o alerta de código vazio
            hasBootedRef.current = true;
        }
    }, [error]);

    // Função que "inicia" o sandbox do StackBlitz
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
             // Reseta todos os loadings em caso de erro no StackBlitz
             setIsSubmitting(false);
             setIsBootingSandbox(false);
             alert(`Erro ao iniciar o ambiente de prototipagem: ${err.message}`);
        })
    };

    // Estado geral de loading (API ou Sandbox)
    const isLoading = isSubmitting || isBootingSandbox;

    // A Interface do Usuário (JSX)
    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Descreva a interface que você quer prototipar..."
                    style={textAreaStyle}
                    disabled={isLoading} // Desabilita enquanto carrega
                />
                <button type="submit" style={buttonStyle} disabled={isLoading || !input.trim()}> {/* Desabilita se estiver carregando ou vazio */}
                    {/* Texto do botão muda conforme o estado */}
                    {isLoadingCompletionHook ? "Gerando Código..." : (isBootingSandbox ? "Compilando Protótipo..." : "Gerar Protótipo ao Vivo")}
                </button>
            </form>

             {/* Mostra erro da API (se houver e não estiver carregando) */}
             {error && !isLoading && (
                <div style={{ color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>
                    <strong>Erro da API:</strong> {error.message}
                </div>
             )}

            {/* Container do Sandbox */}
            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {/* Mensagem de Loading */}
                {isLoading && (
                    <div style={loadingStyle}>
                        {isLoadingCompletionHook ? "Aguarde... Gerando código com IA..." : "Iniciando servidor virtual e compilando..."}
                        <br/>
                        (Isso pode levar até 30 segundos)
                    </div>
                )}
                 {/* Mensagem Inicial (Apenas se não estiver carregando e o sandbox estiver vazio) */}
                {!isLoading && (!sandboxRef.current || sandboxRef.current.innerHTML === "") && (
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
    border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative' /* Ajuda a conter o loading */
};
const loadingStyle: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, // Centraliza
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "#888", fontSize: "14px", background: '#0A0A0A' // Garante fundo
};
