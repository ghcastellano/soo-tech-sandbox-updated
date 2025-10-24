"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Não precisamos mais de '@ai-sdk/react'

// --- Componentes de Estilização para Markdown (Mantidos) ---
const components = {
    h2: ({node, ...props}: any) => <h2 style={styles.h2} {...props} />,
    ul: ({node, ...props}: any) => <ul style={styles.ul} {...props} />,
    li: ({node, ...props}: any) => <li style={styles.li} {...props} />,
    p: ({node, ...props}: any) => <p style={styles.p} {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre style={styles.codeBlock}><code className={className} {...props}>{children}</code></pre>
      ) : (
        <code style={styles.inlineCode} className={className} {...props}>{children}</code>
      );
    },
    strong: ({node, ...props}: any) => <strong style={styles.strong} {...props} />,
    a: ({node, ...props}: any) => <a style={styles.link} target="_blank" rel="noopener noreferrer" {...props} />,
};
// --- Fim dos Componentes de Estilização ---

// --- ESTILOS MODERNIZADOS (Mantidos) ---
const styles = {
    // ... Cole aqui o objeto 'styles' completo da resposta anterior ...
    container: { width: "100%", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif", color: "#E0E0E0", background: "#050505", padding: "40px 50px", boxSizing: 'border-box', minHeight: '100vh' } as React.CSSProperties,
    title: { color: "#FFFFFF", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, marginBottom: "15px", textAlign: 'center' } as React.CSSProperties,
    description: { color: "#A0A0A0", fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", marginBottom: "40px", textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 } as React.CSSProperties,
    textArea: { width: "100%", minHeight: "80px", padding: "18px", background: "#111", color: "#E0E0E0", border: "1px solid #333", borderRadius: "8px", fontFamily: "inherit", fontSize: "1rem", boxSizing: "border-box", resize: 'vertical', marginBottom: '15px', transition: 'border-color 0.2s, box-shadow 0.2s', outline: 'none', } as React.CSSProperties,
    button: { width: "100%", padding: "18px", background: "linear-gradient(90deg, #3EFF9B 0%, #00CFFF 100%)", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold", transition: 'opacity 0.2s, transform 0.1s', outline: 'none', } as React.CSSProperties,
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' } as React.CSSProperties,
    blueprintContainer: { width: "100%", background: "#0F0F0F", border: "1px solid #282828", borderRadius: "12px", overflow: "hidden", position: 'relative', marginTop: '40px', padding: '10px 30px 30px 30px', minHeight: '300px' } as React.CSSProperties,
    loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#777", fontSize: "1rem", minHeight: '200px', paddingTop: '50px', paddingBottom: '50px' } as React.CSSProperties,
    spinner: { width: '30px', height: '30px', marginBottom: '15px', animation: 'spin 1s linear infinite' } as React.CSSProperties,
    error: { color: '#FF8A8A', marginTop: '20px', whiteSpace: 'pre-wrap', border: '1px solid #FF8A8A', padding: '15px', borderRadius: '8px', background: 'rgba(255, 107, 107, 0.05)', fontSize: '0.9rem' } as React.CSSProperties,
    h2: { color: '#3EFF9B', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '40px', marginBottom: '20px', fontSize: '1.6rem', fontWeight: 600 } as React.CSSProperties,
    ul: { paddingLeft: '25px', marginBottom: '20px', listStyle: 'disc' } as React.CSSProperties,
    li: { marginBottom: '10px', lineHeight: 1.7 } as React.CSSProperties,
    p: { marginBottom: '15px', lineHeight: 1.7, color: '#BDBDBD' } as React.CSSProperties,
    inlineCode: { backgroundColor: '#2a2a2a', padding: '3px 7px', borderRadius: '4px', fontFamily: '"Fira Code", monospace', fontSize: '0.9em', color: '#00CFFF' } as React.CSSProperties,
    codeBlock: { backgroundColor: '#1C1C1C', padding: '15px', borderRadius: '6px', fontFamily: '"Fira Code", monospace', fontSize: '0.9em', overflowX: 'auto', marginBottom: '15px', border: '1px solid #333', whiteSpace: 'pre-wrap' } as React.CSSProperties,
    strong: { color: '#FFFFFF', fontWeight: 600 } as React.CSSProperties,
    link: { color: '#00CFFF', textDecoration: 'none', borderBottom: '1px dotted #00CFFF', transition: 'color 0.2s' } as React.CSSProperties,
};
// --- FIM DOS ESTILOS ---

export default function SolutionBlueprintGenerator() {
    console.log(`[${new Date().toISOString()}] [Frontend] Renderizando SolutionBlueprintGenerator...`);

    const [input, setInput] = useState(""); // Estado manual para o input
    const [blueprintMarkdown, setBlueprintMarkdown] = useState<string | null>(null); // Estado para guardar o Markdown
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função Fetch Manual para buscar o Markdown
    const fetchBlueprint = async (prompt: string) => {
        setIsLoadingAPI(true);
        setError(null);
        setBlueprintMarkdown(null); // Limpa o blueprint anterior
        console.log(`[${new Date().toISOString()}] [Frontend] Iniciando fetch para /api/generateApp com prompt:`, prompt);

        try {
            const response = await fetch('/api/generateApp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            console.log(`[${new Date().toISOString()}] [Frontend] Resposta da API recebida, status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[${new Date().toISOString()}] [Frontend] Erro na resposta da API: ${errorText}`);
                throw new Error(`Erro da API (${response.status}): ${errorText || response.statusText}`);
            }

            if (!response.body) {
                throw new Error("Resposta da API não contém corpo (body).");
            }

            // Ler a stream de texto
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let markdownAccumulator = "";
            console.log(`[${new Date().toISOString()}] [Frontend] Começando a ler a stream...`);

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log(`[${new Date().toISOString()}] [Frontend] Stream finalizada.`);
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                markdownAccumulator += chunk;
                // Atualiza o estado a cada chunk para efeito de streaming na UI
                setBlueprintMarkdown(markdownAccumulator);
            }

            console.log(`[${new Date().toISOString()}] [Frontend] Markdown final acumulado (${markdownAccumulator.length} chars).`);

            // Validação final (opcional, mas boa prática)
            if (!markdownAccumulator || markdownAccumulator.trim().length === 0) {
                 console.warn(`[${new Date().toISOString()}] [Frontend] Alerta: Markdown final está vazio.`);
                 setError("A IA respondeu, mas o blueprint gerado está vazio.");
                 setBlueprintMarkdown(null); // Garante que fique nulo para mostrar mensagem correta
            } else {
                 console.log(`[${new Date().toISOString()}] [Frontend] Markdown recebido com sucesso.`);
            }

        } catch (err: any) {
            console.error(`[${new Date().toISOString()}] [Frontend] Erro durante o fetch ou leitura da stream:`, err);
            setError(err.message || "Erro desconhecido ao buscar blueprint.");
        } finally {
            setIsLoadingAPI(false); // Finaliza o loading da API
            console.log(`[${new Date().toISOString()}] [Frontend] Fetch finalizado.`);
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput || isLoadingAPI) return;
        console.log(`[${new Date().toISOString()}] [Frontend] handleFormSubmit: Submetendo com input: "${currentInput}"`);
        fetchBlueprint(currentInput);
    };

    // Lógica de renderização
    const showLoading = isLoadingAPI;
    const hasBlueprintContent = blueprintMarkdown && blueprintMarkdown.trim().length > 0;
    const showResult = hasBlueprintContent;
    const displayError = error;
    const showInitialMessage = !isLoadingAPI && !hasBlueprintContent && !displayError;

    console.log(`[${new Date().toISOString()}] [Frontend] Status Renderização: isLoading=${isLoadingAPI}, hasBlueprintContent=${hasBlueprintContent}, displayError=${displayError ? `"${displayError}"` : 'null'}`);


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Soo Tech AI Solution Pathfinder</h2>
            <p style={styles.description}>
                Descreva seu desafio ou objetivo de negócio. Nossa IA analisará e gerará um Blueprint Estratégico para uma solução de ponta, ao vivo.
            </p>

            <form onSubmit={handleFormSubmit} style={{ width: '100%', marginBottom: "25px" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)} // Atualiza estado manual
                    placeholder="Ex: 'Reduzir churn de clientes B2B', 'Otimizar rotas de entrega', 'Prever demanda de estoque'..."
                    style={styles.textArea}
                    disabled={isLoadingAPI}
                    rows={4}
                />
                <button type="submit" style={isLoadingAPI || !input.trim() ? {...styles.button, ...styles.buttonDisabled} : styles.button} disabled={isLoadingAPI || !input.trim()}>
                    {isLoadingAPI ? "Analisando e Gerando Blueprint..." : "Gerar Blueprint de Solução"}
                </button>
            </form>

             {displayError && (
                 <div style={styles.error}>
                     <strong>Erro:</strong> {displayError}
                 </div>
             )}

            <div style={styles.blueprintContainer}>
                {/* Mostra loading sempre que a API estiver ativa */}
                {showLoading && (
                    <div style={styles.loading}>
                         <svg aria-hidden="true" style={styles.spinner} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
                        Analisando seu desafio e construindo a solução...
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
                {/* Renderiza o Markdown em tempo real, mesmo durante o loading se já tiver conteúdo */}
                {hasBlueprintContent && (
                    // Adiciona uma div wrapper para esconder o loading quando o conteúdo aparecer
                    <div style={{ display: showLoading ? 'none' : 'block' }}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={components}
                            children={blueprintMarkdown || ""} // Passa o estado 'blueprintMarkdown'
                        />
                    </div>
                )}
                 {/* Mensagem Inicial (Apenas se não estiver carregando E não tiver resultado E não tiver erro) */}
                 {showInitialMessage && (
                      <div style={styles.loading}>Seu Blueprint Estratégico aparecerá aqui.</div>
                 )}
            </div>
        </div>
    )
}

// --- FIM DO COMPONENTE ---
