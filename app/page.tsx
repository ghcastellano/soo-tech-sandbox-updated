"use client";

import React, { useState, useRef } from "react"
import { useCompletion } from "@ai-sdk/react"
import sdk from "@stackblitz/sdk"

// --- ARQUIVOS DE SISTEMA PARA O SANDBOX (BOILERPLATE) ---
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title></head>
  <body><div id="root"></div><script type="module" src="/src/index.tsx"></script></body>
</html>
`
const indexTsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`
const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
`
const postcssConfig = `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`
const packageJson = `
{
  "name": "vite-react-typescript-tailwind-prototype",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" },
  "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
`
// --- FIM DO BOILERPLATE ---

export default function LiveSandbox() {
    const [isLoading, setIsLoading] = useState(false)
    const sandboxRef = useRef<HTMLDivElement>(null)

    const { input, handleInputChange, handleSubmit } = useCompletion({
        api: "/api/generateApp",
        onFinish: (prompt, generatedCode) => {
            console.log("IA terminou. Gerando o sandbox...")
            bootSandbox(generatedCode)
        },
    })

    const bootSandbox = (appCode: string) => {
        if (!sandboxRef.current) return
        sdk.embedProject(
            sandboxRef.current,
            {
                title: "Protótipo Gerado pela Soo Tech",
                template: "javascript", // <-- ESTA É A LINHA CORRIGIDA
                files: {
                    "index.html": indexHtml,
                    "package.json": packageJson,
                    "tailwind.config.js": tailwindConfig,
                    "postcss.config.js": postcssConfig,
                    "src/index.css": indexCss,
                    "src/index.tsx": indexTsx,
                    "src/App.tsx": appCode,
                },
                settings: { compile: { trigger: "auto", clearConsole: true } },
            },
            {
                openFile: "src/App.tsx",
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
