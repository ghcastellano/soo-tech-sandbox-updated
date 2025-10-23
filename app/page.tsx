"use client";

import React, { useState, useRef } from "react"
import { useCompletion } from "@ai-sdk/react"
import sdk from "@stackblitz/sdk"

// --- NOVOS ARQUIVOS DE SISTEMA (COM A CORREÇÃO NO indexTsx) ---

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

// Este será o 'index.ts' (COM A SINTAXE ANTIGA DO REACTDOM)
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
  background-color: #1e1e1e;
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

    // Modifique o useCompletion para ficar assim:
const { input, handleInputChange, handleSubmit } = useCompletion({
    api: "/api/generateApp",
    onFinish: (prompt, generatedCode) => {
        // LOG PARA VER O QUE RECEBEMOS
        console.log("Código recebido da API:", generatedCode); 

        if (generatedCode && generatedCode.trim().length > 0) {
            console.log("Gerando o sandbox...");
            bootSandbox(generatedCode);
        } else {
            console.error("Erro: Código gerado está vazio!");
            setIsLoading(false); // Para o loading
            alert("Erro: A IA não retornou um código válido. Tente novamente ou verifique o console.");
        }
    },
    onError: (error) => {
        // LOG PARA VER ERROS DA API
        console.error("Erro ao chamar a API:", error);
        setIsLoading(false); // Para o loading
        alert(`Erro ao comunicar com a IA: ${error.message}. Verifique o console.`);
    }
})

    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return
        sdk.embedProject(
            sandboxRef.current,
            {
                title: "Protótipo Gerado pela Soo Tech",
                template: "typescript",
                files: {
                    "index.html": indexHtml,
                    "index.ts": indexTsx,   // Passa o conteúdo corrigido
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
        )
        setIsLoading(false)
    }

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        if (sandboxRef.current) {
            sandboxRef.current.innerHTML = ""
        }
        handleSubmit(e)
    }

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
            <div ref={sandboxRef} id="sandbox-container" style={sandboxContainerStyle}>
                {isLoading && (
                    <div style={loadingStyle}>
                        Aguarde... Iniciando servidor virtual e compilando...
                        <br/>
                        (Isso pode levar até 30 segundos)
                    </div>
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
}
const buttonStyle: React.CSSProperties = {
    width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontSize: "16px", fontWeight: "bold", marginTop: "8px",
}
const sandboxContainerStyle: React.CSSProperties = {
    width: "100%", height: "500px", background: "#0A0A0A",
    border: "1px solid #333", borderRadius: "8px", overflow: "hidden",
}
const loadingStyle: React.CSSProperties = {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", textAlign: "center",
    color: "#888", fontSize: "14px",
}
