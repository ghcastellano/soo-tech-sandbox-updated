"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import sdk from "@stackblitz/sdk";

// --- ARQUIVOS DE SISTEMA (Simplificados - Sem mudanças) ---
const indexHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AI Prototype</title><link rel="stylesheet" href="styles.css"></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nimport './styles.css';\n\nconst rootElement = document.getElementById('root');\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  rootElement\n);`;
const stylesCss = `body { font-family: sans-serif; background-color: #1e1e1e; color: white; margin: 0; padding: 0; } #root { padding: 1rem; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

// --- PACOTE JSON PARA O SANDBOX (Vite + React + TS) ---
const packageJson = `
{
  "name": "react-ts-prototype",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5" 
  }
}
`;
// --- FIM DO PACOTE JSON ---


export default function LiveSandbox() {
    const [isLoading, setIsLoading] = useState(false);
    const [isBootingSandbox, setIsBootingSandbox] = useState(false);
    const sandboxRef = useRef<HTMLDivElement>(null);
    const hasBootedRef = useRef(false);
    const [promptSubmitted, setPromptSubmitted] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const {
        input,
        setInput,
        handleInputChange,
        handleSubmit: handleTriggerCompletion,
        completion,
        isLoading: isLoadingCompletionHook,
    } = useCompletion({
        api: "/api/generateApp",
        onError: (err) => {
             console.error("Erro recebido do hook useCompletion:", err);
             setError(`Erro ao gerar código: ${err.message}`);
             setIsLoading(false);
             setPromptSubmitted(null);
        }
    });

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoading) return;

        setPromptSubmitted
