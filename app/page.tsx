"use client";

import React, { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Componentes de Estilização Customizados para Markdown ---
const components = {
    h2: ({node, ...props}: any) => <h2 style={styles.h2} {...props} />,
    ul: ({node, ...props}: any) => <ul style={styles.ul} {...props} />,
    li: ({node, ...props}: any) => <li style={styles.li} {...props} />,
    p: ({node, ...props}: any) => <p style={styles.p} {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '');
      // Renderiza como bloco <pre><code> se tiver linguagem ou múltiplas linhas
      const isBlock = !inline || String(children).includes('\n'); 
      return isBlock ? (
        <pre style={styles.codeBlock}><code className={className} {...props}>{children}</code></pre>
      ) : (
        <code style={styles.inlineCode} className={className} {...props}>{children}</code>
      );
    },
    strong: ({node, ...props}: any) => <strong style={styles.strong} {...props} />,
    a: ({node, ...props}: any) => <a style={styles.link} target="_blank" rel="noopener noreferrer" {...props} />,
    // Adicionar estilos para outros elementos se necessário (ex: blockquote, table)
};
// --- Fim dos Componentes ---

export default function SolutionBlueprintGenerator() {
    console.log(`[${new Date().toISOString()}] [Frontend] Renderizando...`);
    const [uiError, setUiError] = useState<string | null>(null); // Erro específico da UI

    const {
        input,
        handleInputChange,
        handleSubmit,
        completion,
        isLoading,
        error: apiError, // Erro vindo do hook/API
        stop,
    } = useCompletion({
        api: "/api/generateApp",
        initialInput: "",
        onFinish: ({ completion: finalCompletion } = {}) => {
            console.log(`[${new Date().toISOString()}] [Frontend] useCompletion: onFinish. Completion final: ${finalCompletion?.length ?? 0} chars.`);
            if (!isLoading && (!finalCompletion || finalCompletion.trim().length === 0) && !apiError) {
                console.warn(`[${new Date().toISOString()}] [Frontend] useCompletion: onFinish - Completion final VAZIO detectado.`);
                setUiError("A IA processou sua solicitação, mas não conseguiu gerar um blueprint. Tente reformular seu desafio ou ser mais específico.");
            }
        },
        onError: (error) => {
             console.error(`[${new Date().toISOString()}] [Frontend] useCompletion: onError capturou:`, error);
             // O estado 'apiError' será atualizado, o useEffect tratará a UI
        },
    });

    // Efeito para logar e definir o erro da UI baseado no erro da API
     useEffect(() => {
         if (apiError) {
             console.error(`[${new Date().toISOString()}] [Frontend] useEffect[apiError]: Erro da API detectado:`, apiError);
             // Tenta pegar uma mensagem mais amigável do erro, se disponível
             const message = apiError.message.includes('API Error') ? apiError.message : "Ocorreu um erro inesperado ao conectar com a IA. Por favor, tente novamente mais tarde.";
             setUiError(message);
         } else {
             // Limpa o erro da UI se a API não reportar erro (na próxima tentativa)
             // setUiError(null); // Limpar aqui pode esconder o erro de 'completion vazio'
         }
     }, [apiError]);

     // Log de status de loading
     useEffect(() => { console.log(`[${new Date().toISOString()}] [Frontend] useEffect[isLoading]: Mudou para ${isLoading}`); }, [isLoading]);


    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const currentInput = input.trim();
        console.log(`[${new Date().toISOString()}] [Frontend] handleFormSubmit: Submetendo com input: "${currentInput}"`);
        setUiError(null); // Limpa erros antigos ao submeter novo prompt
        handleSubmit(e);
    };

    // Lógica de renderização
    const showLoading = isLoading;
    const hasCompletionContent = completion && completion.trim().length > 0;
    const displayError = uiError || (apiError?.message && `Erro: ${apiError.message}`); // Prioriza o erro da UI, depois o da API
    const showResult = hasCompletionContent;
    const showInitialMessage = !isLoading && !hasCompletionContent && !displayError;

    console.log(`[${new Date().toISOString()}] [Frontend] Status Renderização: isLoading=${isLoading}, hasCompletionContent=${hasCompletionContent}, displayError=${displayError ? `"${displayError}"` : 'null'}`);

    return (
        <div style={styles.container}>
            {/* Título Alinhado com a Marca */}
            <h2 style={styles.title}>Diagnóstico Inteligente Soo Tech</h2>
            {/* Descrição Aprimorada */}
            <p style={styles.description}>
                Qual o maior desafio ou oportunidade do seu negócio hoje? Descreva-o abaixo e nossa IA, como um consultor sênior, gerará um **Blueprint Estratégico** de como a Soo Tech pode ajudar a transformar essa questão em resultados tangíveis, ao vivo.
            </p>

            <form onSubmit={handleFormSubmit} style={{ width: '100%', maxWidth: '800px', margin: '0 auto 40px auto' }}> {/* Centraliza e limita largura */}
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ex: 'Preciso reduzir o tempo de ciclo das minhas entregas de software.', 'Quero usar IA para prever quais clientes podem cancelar o serviço.', 'Como posso otimizar meus custos de logística com análise de dados?'..."
                    style={styles.textArea}
                    disabled={isLoading}
                    rows={4} // Ajustável
                />
                <button
                    type="submit"
                    style={isLoading || !input.trim() ? {...styles.button, ...styles.buttonDisabled} : styles.button}
                    disabled={isLoading || !input.trim()}
                    onMouseOver={(e) => { if (!isLoading && input.trim()) e.currentTarget.style.opacity = '0.9'; }} // Efeito hover sutil
                    onMouseOut={(e) => { if (!isLoading && input.trim()) e.currentTarget.style.opacity = '1'; }}
                >
                    {isLoading ? "Analisando e Gerando Blueprint..." : "Gerar Blueprint Estratégico"}
                </button>
            </form>

             {/* Tratamento de Erro Profissional */}
             {displayError && (
                 <div style={styles.error}>
                     <strong>Ocorreu um Problema:</strong>
                     <p>{displayError}</p>
                     <small>Por favor, tente refazer sua pergunta ou contate-nos se o erro persistir.</small>
                 </div>
             )}

            {/* Container do Blueprint com Melhorias Visuais */}
            <div style={styles.blueprintContainer}>
                {showLoading && !hasCompletionContent && (
                    <div style={styles.loading}>
                         <svg aria-hidden="true" style={styles.spinner} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
                        Analisando seu desafio e construindo a solução...
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
                {/* Renderiza o Markdown em tempo real */}
                {showResult && (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components} // Aplica nossos estilos customizados
                        children={completion} // Diretamente do hook
                    />
                )}
                 {/* Mensagem Inicial */}
                 {showInitialMessage && (
                      <div style={styles.loading}>Seu Blueprint Estratégico personalizado aparecerá aqui.</div>
                 )}
            </div>
        </div>
    )
}

// --- ESTILOS FINAIS ---
// Baseados no seu site e refinados para o componente
const styles = {
    container: { width: "100%", fontFamily: "'Sora', sans-serif", // Fonte similar à do seu site, com fallback
                 color: "#E0E0E0", background: "#000000", // Fundo preto como base do seu site
                 padding: "40px 5vw", boxSizing: 'border-box', minHeight: '100vh' } as React.CSSProperties,
    title: { color: "#FFFFFF", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 600, marginBottom: "15px", textAlign: 'center' } as React.CSSProperties,
    description: { color: "#A0A0A0", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", marginBottom: "40px", textAlign: 'center', maxWidth: '850px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 } as React.CSSProperties,
    textArea: {
        width: "100%", minHeight: "100px", padding: "18px", background: "#111",
        color: "#E0E0E0", border: "1px solid #333", borderRadius: "8px",
        fontFamily: "inherit", fontSize: "1rem", boxSizing: "border-box", resize: 'vertical', marginBottom: '15px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none',
        '::placeholder': { color: '#666' }
    } as React.CSSProperties,
    // Estilo para focar no textarea (requer state ou CSS externo, mas pode ser simulado)
    // textAreaFocus: { borderColor: '#3EFF9B', boxShadow: '0 0 0 2px rgba(62, 255, 155, 0.3)' },
    button: {
        width: "100%", padding: "18px",
        background: "linear-gradient(90deg, #3EFF9B 0%, #00CFFF 100%)", // Gradiente como no seu site
        color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer",
        fontSize: "1.1rem", fontWeight: "bold", transition: 'opacity 0.2s, transform 0.1s',
        outline: 'none',
        marginTop: '10px'
    } as React.CSSProperties,
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' } as React.CSSProperties,
    blueprintContainer: {
        width: "100%", background: "#0D0D0D", // Tom ligeiramente diferente do fundo
        border: "1px solid #222", // Borda sutil
        borderRadius: "12px",
        marginTop: '40px',
        padding: '20px clamp(15px, 5vw, 40px) 40px clamp(15px, 5vw, 40px)', // Padding responsivo
        minHeight: '300px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', // Sombra sutil
        overflowX: 'hidden', // Evita overflow horizontal do container principal
    } as React.CSSProperties,
    loading: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#666", fontSize: "1rem", minHeight: '200px', paddingTop: '50px', paddingBottom: '50px' } as React.CSSProperties,
    spinner: { width: '35px', height: '35px', marginBottom: '20px', animation: 'spin 1.2s linear infinite', color: '#3EFF9B' } as React.CSSProperties, // Spinner verde
    error: { color: '#FFAAAA', marginTop: '20px', whiteSpace: 'pre-wrap', border: '1px solid #552222', padding: '15px 20px', borderRadius: '8px', background: 'rgba(255, 107, 107, 0.08)', fontSize: '0.95rem' } as React.CSSProperties,
    // --- Estilos para Markdown (Alinhados com Soo Tech) ---
    h2: { // Cabeçalhos das seções do Blueprint
        color: '#3EFF9B', // Verde Soo Tech
        borderBottom: '1px solid #333',
        paddingBottom: '12px',
        marginTop: '45px', // Mais espaço antes
        marginBottom: '25px',
        fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', // Tamanho responsivo
        fontWeight: 600
    } as React.CSSProperties,
    ul: { paddingLeft: '25px', marginBottom: '20px', listStyleType: "'→ '" } as React.CSSProperties, // Marcador customizado
    li: { marginBottom: '12px', lineHeight: 1.8, paddingLeft: '5px' } as React.CSSProperties,
    p: { marginBottom: '18px', lineHeight: 1.8, color: '#BDBDBD' } as React.CSSProperties,
    inlineCode: { backgroundColor: 'rgba(0, 207, 255, 0.1)', padding: '3px 8px', borderRadius: '4px', fontFamily: '"Fira Code", monospace', fontSize: '0.9em', color: '#00CFFF' } as React.CSSProperties, // Azul Soo Tech
    codeBlock: { backgroundColor: '#050505', padding: '18px', borderRadius: '8px', fontFamily: '"Fira Code", monospace', fontSize: '0.9em', overflowX: 'auto', marginBottom: '20px', border: '1px solid #222', whiteSpace: 'pre-wrap', wordWrap: 'break-word' } as React.CSSProperties, // Garante quebra de linha
    strong: { color: '#FFFFFF', fontWeight: 600 } as React.CSSProperties,
    a: {
        color: '#00CFFF', // Azul Soo Tech
        textDecoration: 'none',
        borderBottom: '1px solid rgba(0, 207, 255, 0.4)',
        transition: 'color 0.2s, border-color 0.2s'
    } as React.CSSProperties,
    // aHover: { color: '#3EFF9B', borderBottomColor: '#3EFF9B' } // Adicionar via CSS se possível
};
// --- FIM DOS ESTILOS ---
