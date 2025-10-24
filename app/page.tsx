"use client";

import React, { useState, useEffect } from "react";
// Não precisamos mais do StackBlitz SDK ou useCompletion

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null); // Estado para guardar o HTML
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionTrigger, setSubmissionTrigger] = useState(0); // Para saber quando o fetch terminou

    // Função Fetch Manual (adaptada para HTML)
    const fetchGeneratedHtml = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        setGeneratedHtml(null); // Limpa o HTML anterior
        console.log("Iniciando fetch para /api/generateApp (HTML) com prompt:", prompt);
        try {
            const response = await fetch('/api/generateApp', { // A API é a mesma
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
            });
            console.log("Resposta da API recebida, status:", response.status);
            if (!response.ok) {
                const errorText = await response.text(); throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`);
            }
            if (!response.body) { throw new Error("Resposta da API vazia."); }

            // Ler a stream de texto completa
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let htmlAccumulator = "";
            console.log("Lendo stream...");
            while (true) {
                const { done, value } = await reader.read();
                if (done) { console.log("Stream finalizada."); break; }
                htmlAccumulator += decoder.decode(value, { stream: true });
            }
            console.log("HTML final acumulado:", htmlAccumulator);

            // Verifica se a IA retornou algo minimamente parecido com HTML
            if (htmlAccumulator && htmlAccumulator.trim().toLowerCase().includes('<html>')) {
                setGeneratedHtml(htmlAccumulator); // Define o estado com o HTML completo
            } else {
                 console.error("Erro: A resposta da IA não parece ser HTML válido:", htmlAccumulator);
                 setError("A IA respondeu, mas o formato não parece ser HTML válido.");
                 setGeneratedHtml(null); // Garante que fique nulo
            }

        } catch (err: any) {
            console.error("Erro durante o fetch ou leitura da stream:", err);
            setError(err.message || "Erro desconhecido.");
        } finally {
            setIsLoadingAPI(false);
            console.log("Fetch finalizado.");
            setSubmissionTrigger(prev => prev + 1); // Dispara o useEffect
        }
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI) return;
        fetchGeneratedHtml(currentInput);
    };

    // Interface (JSX - Com iframe e srcdoc)
    return (
        <div style={{ width: "100%", fontFamily: "sans-serif", color: "white", background: "#0A0A0A", padding: "20px" }}>
            <form onSubmit={onFormSubmit} style={{ marginBottom: "16px" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Descreva a interface HTML que você quer prototipar..." // Atualizado placeholder
                    style={textAreaStyle}
                    disabled={isLoadingAPI}
                />
                <button type="submit" style={buttonStyle} disabled={isLoadingAPI || !input.trim()}>
                    {isLoadingAPI ? "Gerando Protótipo HTML..." : "Gerar Protótipo HTML"}
                </button>
            </form>

             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

            {/* Container para o Iframe */}
            <div style={sandboxContainerStyle}>
                {isLoadingAPI && (
                    <div style={loadingStyle}>
                        Aguarde... Gerando código HTML com IA...
                    </div>
                )}
                {!isLoadingAPI && generatedHtml && !error && (
                    <iframe
                        srcDoc={generatedHtml} // INJETA O HTML AQUI
                        style={iframeStyle}
                        sandbox="allow-scripts allow-same-origin" // Permite JS, mas restringe algumas coisas
                        title="Protótipo Gerado por IA"
                    />
                )}
                {!isLoadingAPI && !generatedHtml && !error && (
                     <div style={loadingStyle}>Aguardando seu prompt...</div>
                )}
                 {/* Mensagem se a IA retornou vazio, mesmo sem erro de fetch */}
                 {!isLoadingAPI && generatedHtml === null && submissionTrigger > 0 && !error &&(
                      <div style={loadingStyle}>A IA respondeu, mas o código HTML parece vazio ou inválido.</div>
                 )}
            </div>
        </div>
    )
}

// Estilos
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "100px", padding: "16px", background: "#151515", color: "#FFFFFF", border: "1px solid #333", borderRadius: "8px", fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box" };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "8px" };
const sandboxContainerStyle: React.CSSProperties = { width: "100%", height: "500px", background: "#0A0A0A", border: "1px solid #333", borderRadius: "8px", overflow: "hidden", position: 'relative', marginTop: '20px' };
const loadingStyle: React.CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "14px", background: '#0A0A0A' };
const errorStyle: React.CSSProperties = { color: 'red', marginBottom: '10px', whiteSpace: 'pre-wrap', border: '1px solid red', padding: '10px', borderRadius: '4px', background: '#2a0000' };
const iframeStyle: React.CSSProperties = { width: '100%', height: '100%', border: 'none' };
