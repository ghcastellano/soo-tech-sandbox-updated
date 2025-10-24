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
        // 3. Ainda não bootamos para
