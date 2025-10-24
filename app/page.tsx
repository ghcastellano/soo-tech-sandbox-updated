"use client";

import React, { useState, useRef } from "react"
import { useCompletion } from "@ai-sdk/react" // Import correto
import sdk from "@stackblitz/sdk"

// --- ARQUIVOS DE SISTEMA (Simplificados) ---
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
`
const indexTsx = `
import React from 'react';
import ReactDOM from 'react-dom'; // Import 'react-dom' normal
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

ReactDOM.render( // Usa a sintaxe antiga ReactDOM.render
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
`
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
`
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [isLoading, setIsLoading] = useState(false)
    const sandboxRef = useRef<HTMLDivElement>(null)

    // O hook 'useCompletion' gerencia a chamada para nossa API
    const { input, handleInputChange, handleSubmit, completion } = useCompletion({
        api: "/api/generateApp", // Aponta para o backend

        // CORREÇÃO AQUI: Usar o estado 'completion' no onFinish
        onFinish: (prompt) => { // O segundo parâmetro (generatedCode) às vezes é vazio/instável
            
            // LOG PARA VER O QUE TEMOS NO ESTADO 'completion' quando a stream termina
            console.log("onFinish chamado. Estado 'completion':", completion); 
            
            // USAREMOS a variável 'completion' do hook, que acumula a stream
            const finalCode = completion; 

            if (finalCode && finalCode.trim().length > 0) {
                console.log("Gerando o sandbox com o código do estado 'completion'...");
                bootSandbox(finalCode); // Passa o código do estado para o StackBlitz
            } else {
                console.error("Erro: Código gerado (do estado 'completion') está vazio!");
                setIsLoading(false); // Para o loading
                // Atualiza a mensagem de erro para ser mais clara
                alert("Erro: A IA respondeu, mas o código final está vazio. Verifique os logs do Vercel para ver a resposta da IA. Pode ser um erro no prompt ou na IA.");
            }
        },
        onError: (error) => {
            // LOG PARA VER ERROS DA API
            console.error("Erro ao chamar a API:", error);
            setIsLoading(false); // Para o loading
            alert(`Erro ao comunicar com a IA: ${error.message}. Verifique o console e os logs do Vercel.`);
        }
    })

    // Função que "inicia" o sandbox do StackBlitz
    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return
        sdk.embedProject(
            sandboxRef.current,
            {
                title: "Protótipo Gerado pela Soo Tech",
                template: "typescript", // Mantém o template que funciona
                files: {
                    "index.html": indexHtml,
                    "index.ts": indexTsx,   // Mantém o nome esperado pelo template
                    "styles.css": stylesCss,
                    "App.tsx": appCode,    // O código da IA
                },
            },
            {
                openFile: "App.tsx",
                view: "preview",
                height: 500,
                theme: "dark",
            }
        )
        setIsLoading(false)
    }

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = "" // Limpa o sandbox anterior
        }
        handleSubmit(e) // Inicia a chamada para a IA
    }

    // A aparência do componente
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
                    {isLoading ? "Gerando e Compilando..." : "Gerar Protótipo ao Vivo"}
                </button>
            </form>
            {/* O Sandbox do StackBlitz será injetado aqui */}
            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {isLoading && (
                    <div style={loadingStyle}>
                        Aguarde... Gerando código e iniciando sandbox...
                        <br/>
                        (Isso pode levar até 30 segundos)
                    </div>
                )}
                {/* Adicionado um estado para quando não está carregando e não tem sandbox */}
                {!isLoading && (!sandboxRef.current || sandboxRef.current.innerHTML === "") && (
                     <div style={loadingStyle}>Aguardando seu prompt...</div>
                )}
            </div>
        </div>
    )
}

// Estilos (mantidos)
const textAreaStyle: React.CSSProperties = { /*...*/ };
const buttonStyle: React.CSSProperties = { /*...*/ };
const sandboxContainerStyle: React.CSSProperties = { /*...*/ };
const loadingStyle: React.CSSProperties = { /*...*/ };

// Cola aqui os estilos definidos anteriormente para textAreaStyle, buttonStyle, sandboxContainerStyle, loadingStyle
const stylesTextArea: React.CSSProperties = {
    width: "100%", minHeight: "100px", padding: "16px", background: "#151515",
    color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px",
    fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box",
};
const stylesButton: React.CSSProperties = {
    width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontSize: "16px", fontWeight: "bold", marginTop: "8px",
};
const stylesSandboxContainer: React.CSSProperties = {
    width: "100%", height: "500px", background: "#0A0A0A",
    border: "1px solid #333", borderRadius: "8px", overflow: "hidden",
};
const stylesLoading: React.CSSProperties = {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "#888", fontSize: "14px",
};

// Atribui os estilos às constantes usadas no componente
Object.assign(textAreaStyle, stylesTextArea);
Object.assign(buttonStyle, stylesButton);
Object.assign(sandboxContainerStyle, stylesSandboxContainer);
Object.assign(loadingStyle, stylesLoading);
