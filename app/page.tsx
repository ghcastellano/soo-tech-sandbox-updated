"use client";

import React, { useState, useRef } from "react";
// Nenhuma biblioteca de AI SDK ou Markdown é necessária aqui
// ATENÇÃO: Se você vir 'react-markdown' aqui, delete a linha.
// ATENÇÃO: Se você vir 'useCompletion' aqui, delete a linha.
// ATENÇÃO: Se você vir '@ai-sdk/react' aqui, delete a linha.
// O código abaixo é 100% autônomo com 'fetch'.

export default function LiveSandbox() {
    const [input, setInput] = useState("");
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submissionTimestamp, setSubmissionTimestamp] = useState<number | null>(null);

    // Função Fetch Manual
    const fetchGeneratedHtml = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        setGeneratedHtml(null); 
        setSubmissionTimestamp(Date.now()); 
        console.log(`[${new Date().toISOString()}] [Frontend] Iniciando fetch para /api/generateApp (HTML) com prompt:`, prompt);

        try {
            const response = await fetch('/api/generateApp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }),
            });
            console.log(`[${new Date().toISOString()}] [Frontend] Resposta da API recebida, status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text(); throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`);
            }
            if (!response.body) { throw new Error("Resposta da API vazia."); }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let htmlAccumulator = "";
            console.log(`[${new Date().toISOString()}] [Frontend] Lendo stream...`);

            while (true) {
                const { done, value } = await reader.read();
                if (done) { console.log(`[${new Date().toISOString()}] [Frontend] Stream finalizada.`); break; }
                htmlAccumulator += decoder.decode(value, { stream: true });
                
                // A LINHA QUE CAUSAVA O FLICKER FOI REMOVIDA DAQUI
                // setGeneratedHtml(htmlAccumulator); 
            }

            console.log(`[${new Date().toISOString()}] [Frontend] HTML final acumulado (${htmlAccumulator.length} chars).`);

            // Limpeza final de Markdown (se a IA ainda errar)
            let cleanedHtml = htmlAccumulator.trim();
            if (cleanedHtml.startsWith('```html') && cleanedHtml.endsWith('```')) {
                console.log("Detectado Markdown 'html', limpando...");
                cleanedHtml = cleanedHtml.substring(7, cleanedHtml.length - 3).trim();
            } else if (cleanedHtml.startsWith('```') && cleanedHtml.endsWith('```')) {
                console.log("Detectado Markdown genérico, limpando...");
                cleanedHtml = cleanedHtml.substring(3, cleanedHtml.length - 3).trim();
            }

            // Validação final e renderização de UMA SÓ VEZ
            if (cleanedHtml && cleanedHtml.trim().toLowerCase().startsWith('<!doctype html')) {
                console.log(`[${new Date().toISOString()}] [Frontend] HTML Válido detectado. Atualizando estado de uma vez.`);
                setGeneratedHtml(cleanedHtml); // Define o estado com o HTML completo
            } else {
                 console.error(`[${new Date().toISOString()}] [Frontend] Erro: Resposta não é HTML válido. Início:`, cleanedHtml.substring(0, 100));
                 setError("A IA respondeu, mas o formato do HTML é inválido.");
                 setGeneratedHtml(null);
            }

        } catch (err: any) {
            console.error(`[${new Date().toISOString()}] [Frontend] Erro durante o fetch:`, err);
            setError(err.message || "Erro desconhecido ao buscar blueprint.");
        } finally {
            setIsLoadingAPI(false); // Finaliza o loading da API
            console.log(`[${new Date().toISOString()}] [Frontend] Fetch finalizado.`);
            // O submissionTimestamp já foi setado, não precisa de outro trigger
        }
    };

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI) return;
        fetchGeneratedHtml(currentInput);
    };

    // Lógica de renderização
    const showLoading = isLoadingAPI;
    const hasHtmlContent = generatedHtml && generatedHtml.trim().length > 0;
    const showResult = !isLoadingAPI && hasHtmlContent; // Só mostra resultado se NÃO estiver carregando
    const displayError = error;
    const showInitialMessage = !isLoadingAPI && !hasHtmlContent && !displayError && !submissionTimestamp;
    const showEmptyStatePostSubmit = !isLoadingAPI && !hasHtmlContent && !displayError && submissionTimestamp;


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Diagnóstico Inteligente Soo Tech</h2>
            <p style={styles.description}>
                Descreva seu desafio ou objetivo de negócio. Nossa IA analisará e gerará um **Blueprint Estratégico** de como a Soo Tech pode ajudar a transformar essa questão em resultados tangíveis, ao vivo.
            </p>

            <form onSubmit={onFormSubmit} style={{ width: '100%', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: 'Preciso reduzir o tempo de ciclo das minhas entregas de software.', 'Quero usar IA para prever quais clientes podem cancelar o serviço.', 'Como posso otimizar meus custos de logística com análise de dados?'..."
                    style={styles.textArea}
                    disabled={isLoadingAPI}
                    rows={4}
                />
                <button type="submit" style={isLoadingAPI || !input.trim() ? {...styles.button, ...styles.buttonDisabled} : styles.button} disabled={isLoadingAPI || !input.trim()}>
                    {isLoadingAPI ? "Analisando e Gerando Blueprint..." : "Gerar Blueprint Estratégico"}
                </button>
            </form>

             {error && ( <div style={styles.error}><strong>Erro:</strong> {error}</div> )}

            <div style={styles.blueprintContainer}>
                {/* O iframe só será renderizado se NÃO estiver carregando E tiver HTML válido */}
                {showResult && (
                    <iframe
                        srcDoc={generatedHtml || ""} // Injeta o HTML
                        style={styles.iframe}
                        sandbox="allow-scripts allow-forms allow-modals" // Permite JS básico e modais
                        title="Protótipo Gerado por IA"
                    />
                )}
                
                {/* Mostra o loading */}
                {showLoading && (
                    <div style={styles.loading}>
                        <svg aria-hidden="true" style={styles.spinner} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
                        Analisando seu desafio e construindo a solução...
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
                
                {/* Mensagem Inicial */}
                {showInitialMessage && (
                     <div style={styles.loading}>Seu Blueprint Estratégico personalizado aparecerá aqui.</div>
                )}

                {/* Mensagem se terminou vazio */}
                {showEmptyStatePostSubmit && !error && (
                      <div style={styles.loading}>A IA respondeu, mas o blueprint gerado estava vazio. Tente refazer o prompt.</div>
                 )}
            </div>
        </div>
    )
}

// --- ESTILOS FINAIS ---
// Copie e cole seu objeto 'styles' completo aqui
const styles = {
    container: { width: "100%", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif", color: "#E0E0E0", background: "#050505", padding: "40px 5vw", boxSizing: 'border-box', minHeight: '100vh' } as React.CSSProperties,
    title: { color: "#FFFFFF", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 600, marginBottom: "15px", textAlign: 'center' } as React.CSSProperties,
    description: { color: "#A0A0A0", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", marginBottom: "40px", textAlign: 'center', maxWidth: '850px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 } as React.CSSProperties,
    textArea: {
        width: "100%", minHeight: "100px", padding: "18px", background: "#111",
        color: "#E0E0E0", border: "1px solid #333", borderRadius: "8px",
        fontFamily: "inherit", fontSize: "1rem", boxSizing: "border-box", resize: 'vertical', marginBottom: '15px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
    } as React.CSSProperties,
    button: {
        width: "100%", padding: "18px", background: "linear-gradient(90deg, #3EFF9B 0%, #00CFFF 100%)",
        color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer",
        fontSize: "1.1rem", fontWeight: "bold", transition: 'opacity 0.2s, transform 0.1s',
        outline: 'none',
        marginTop: '10px'
    } as React.CSSProperties,
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' } as React.CSSProperties,
    blueprintContainer: {
        width: "100%", background: "#0D0D0D",
        border: "1px solid #222",
        borderRadius: "12px",
        marginTop: '40px',
        minHeight: '500px', // Altura mínima
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden', // Para conter o iframe
        position: 'relative'
    } as React.CSSProperties,
    iframe: {
        width: '100%',
        height: '100%', // O 'minHeight' do container vai definir a altura
        minHeight: '500px', 
        border: 'none',
        display: 'block' // Remove espaço extra
    } as React.CSSProperties,
    loading: { 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
        textAlign: "center", color: "#666", fontSize: "1rem", 
        padding: '20px'
    } as React.CSSProperties,
    spinner: { width: '35px', height: '35px', marginBottom: '20px', animation: 'spin 1.2s linear infinite', color: '#3EFF9B' } as React.CSSProperties,
    error: { 
        color: '#FFAAAA', marginTop: '20px', whiteSpace: 'pre-wrap', border: '1px solid #552222', 
        padding: '15px 20px', borderRadius: '8px', background: 'rgba(255, 107, 107, 0.08)', 
        fontSize: '0.95rem' 
    } as React.CSSProperties,
};
