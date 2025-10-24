"use client";

import React, { useState, useRef, useEffect } from "react";
// Não precisamos do StackBlitz SDK ou useCompletion

// --- ARQUIVOS DE SISTEMA (Não são mais usados para o boot, mas deixamos aqui por enquanto) ---
const indexHtml = `<!DOCTYPE html><html><head><title>Protótipo</title></head><body><div id="root"></div><script type="module" src="index.ts"></script></body></html>`;
const indexTsx = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\nconst root = document.getElementById('root');\nReactDOM.render(<App />, root);`;
const stylesCss = `body { margin: 0; font-family: sans-serif; }`;
// --- FIM DOS ARQUIVOS DE SISTEMA ---

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionTrigger, setSubmissionTrigger] = useState(0);

    // Função Fetch Manual (sem mudanças na lógica)
    const fetchGeneratedHtml = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        setGeneratedHtml(null);
        console.log("Iniciando fetch para /api/generateApp (Design System) com prompt:", prompt);
        try {
            const response = await fetch('/api/generateApp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }), });
            console.log("Resposta da API recebida, status:", response.status);
            if (!response.ok) { const errorText = await response.text(); throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`); }
            if (!response.body) { throw new Error("Resposta da API vazia."); }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let htmlAccumulator = "";
            console.log("Lendo stream...");
            while (true) { const { done, value } = await reader.read(); if (done) { console.log("Stream finalizada."); break; } htmlAccumulator += decoder.decode(value, { stream: true }); }
            console.log("HTML final acumulado (bruto):", htmlAccumulator);

            let cleanedHtml = htmlAccumulator.trim();
            if (cleanedHtml.startsWith('```html') && cleanedHtml.endsWith('```')) { cleanedHtml = cleanedHtml.substring(7, cleanedHtml.length - 3).trim(); }
            else if (cleanedHtml.startsWith('```') && cleanedHtml.endsWith('```')) { cleanedHtml = cleanedHtml.substring(3, cleanedHtml.length - 3).trim(); }

            if (cleanedHtml && cleanedHtml.trim().toLowerCase().startsWith('<!doctype html')) {
                console.log("HTML Válido detectado. Atualizando estado.");
                setGeneratedHtml(cleanedHtml);
            } else {
                 console.error("Erro: Resposta não parece HTML válido:", cleanedHtml.substring(0, 100) + "...");
                 setError("A IA respondeu, mas o formato não parece ser um documento HTML válido.");
                 setGeneratedHtml(null);
            }
        } catch (err: any) {
            console.error("Erro durante o fetch:", err);
            setError(err.message || "Erro desconhecido.");
        } finally {
            setIsLoadingAPI(false);
            console.log("Fetch finalizado.");
            setSubmissionTrigger(prev => prev + 1);
        }
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI) return;
        fetchGeneratedHtml(currentInput);
    };

    // Interface (JSX - Textos Atualizados)
    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Soo Tech AI Design Studio</h2> {/* Título Novo */}
            <p style={descriptionStyle}>
                Descreva o **conceito da sua marca ou aplicativo**. Nossa IA criará um conjunto de componentes de UI (Mini Design System) com a nossa estética, adaptado à sua ideia. {/* Descrição Nova */}
            </p>

            <form onSubmit={onFormSubmit} style={{ width: '100%', marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: 'fintech moderna para jovens', 'e-commerce de luxo minimalista', 'plataforma de dados B2B séria'..." // Placeholder Novo
                    style={textAreaStyle}
                    disabled={isLoadingAPI}
                />
                <button type="submit" style={buttonStyle} disabled={isLoadingAPI || !input.trim()}>
                    {isLoadingAPI ? "Gerando Design System..." : "Gerar Componentes"} {/* Texto Botão Novo */}
                </button>
            </form>

             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

            {/* Container para o Iframe */}
            <div style={sandboxContainerStyle}>
                {isLoadingAPI && (
                    <div style={loadingStyle}>
                        <svg aria-hidden="true" style={{width: '40px', height: '40px', margin: 'auto', display: 'block'}} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
                        Analisando conceito e gerando componentes...
                    </div>
                )}
                {!isLoadingAPI && generatedHtml && !error && (
                    <iframe
                        srcDoc={generatedHtml}
                        style={iframeStyle}
                        sandbox="allow-scripts allow-same-origin allow-modals" // Permitindo modals
                        title="Protótipo de Design System Gerado por IA"
                    />
                )}
                {!isLoadingAPI && !generatedHtml && !error && (
                     <div style={loadingStyle}>
                        {submissionTrigger > 0 ? "Falha ao gerar o Design System." : "Seu Design System Snippet aparecerá aqui."}
                    </div>
                )}
            </div>
        </div>
    )
}

// Estilos (mantidos)
const containerStyle: React.CSSProperties = { width: "100%", fontFamily: "system-ui, sans-serif", color: "#E0E0E0", background: "#0A0A0A", padding: "30px", boxSizing: 'border-box' };
const titleStyle: React.CSSProperties = { color: "#FFFFFF", fontSize: "1.8rem", fontWeight: 600, marginBottom: "10px", textAlign: 'center' };
const descriptionStyle: React.CSSProperties = { color: "#BDBDBD", fontSize: "1rem", marginBottom: "25px", textAlign: 'center', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 };
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "120px", padding: "16px", background: "#181818", color: "#E0E0E0", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box", resize: 'vertical' };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold", marginTop: "10px", transition: 'opacity 0.2s' };
const sandboxContainerStyle: React.CSSProperties = { width: "100%", height: "70vh", minHeight: '500px', background: "#151515", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative', marginTop: '30px' };
const loadingStyle: React.CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px", background: '#151515' };
const errorStyle: React.CSSProperties = { color: '#FF6B6B', marginBottom: '15px', whiteSpace: 'pre-wrap', border: '1px solid #FF6B6B', padding: '12px', borderRadius: '4px', background: 'rgba(255, 107, 107, 0.1)' };
const iframeStyle: React.CSSProperties = { width: '100%', height: '100%', border: 'none' };
