"use client";

import React, { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react"; // Usaremos para input e status
import ReactMarkdown from 'react-markdown'; // Importa o componente
import remarkGfm from 'remark-gfm'; // Plugin para tabelas, etc (GitHub Flavored Markdown)

// Estilos específicos para o Markdown renderizado
const markdownStyles: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#151515', // Fundo dos cards
    borderRadius: '8px',
    border: '1px solid #333',
    color: '#E0E0E0',
    lineHeight: 1.7,
    marginTop: '30px',
};

const h2Style: React.CSSProperties = {
    color: '#3EFF9B', // Verde Soo Tech
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
    marginTop: '30px',
    marginBottom: '15px',
    fontSize: '1.4rem'
};

const ulStyle: React.CSSProperties = {
    paddingLeft: '20px',
    marginBottom: '15px'
};

const liStyle: React.CSSProperties = {
    marginBottom: '8px'
};

const codeStyle: React.CSSProperties = {
    backgroundColor: '#2a2a2a',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.9em'
};

const strongStyle: React.CSSProperties = {
    color: '#FFFFFF' // Destaca negrito
};


export default function SolutionBlueprintGenerator() {
    const [error, setError] = useState<string | null>(null);

    const {
        input,
        handleInputChange,
        handleSubmit, // Usaremos o handleSubmit padrão
        completion, // O Markdown gerado pela IA
        isLoading,
        error: apiError, // Erro do hook
    } = useCompletion({
        api: "/api/generateApp", // A API é a mesma, só o prompt mudou
        //onError já é tratado pelo estado 'error' do hook
    });

     // Atualiza nosso estado de erro local quando o hook reporta um erro
     useEffect(() => {
        if (apiError) {
            console.error("Erro recebido do useCompletion:", apiError);
            setError(`Erro ao comunicar com a IA: ${apiError.message}. Verifique os logs.`);
        } else {
             setError(null); // Limpa o erro se a nova requisição começar bem
        }
     }, [apiError]);


    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Limpa erros anteriores ao submeter
        handleSubmit(e); // Chama a função do hook para iniciar a requisição
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Soo Tech AI Solution Pathfinder</h2>
            <p style={descriptionStyle}>
                Descreva seu desafio ou objetivo de negócio. Nossa IA analisará e gerará um Blueprint Estratégico para uma solução de ponta.
            </p>

            <form onSubmit={onFormSubmit} style={{ width: '100%', marginBottom: "25px" }}>
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ex: 'Reduzir churn de clientes B2B', 'Otimizar rotas de entrega', 'Prever demanda de estoque'..."
                    style={textAreaStyle}
                    disabled={isLoading}
                    rows={4} // Aumentar um pouco
                />
                <button type="submit" style={buttonStyle} disabled={isLoading || !input.trim()}>
                    {isLoading ? "Analisando e Gerando Blueprint..." : "Gerar Blueprint de Solução"}
                </button>
            </form>

             {/* Mostra erro da API, se houver */}
             {error && ( <div style={errorStyle}><strong>Erro:</strong> {error}</div> )}

            {/* Container para o Blueprint Renderizado */}
            {/* Mostra o container mesmo durante o loading para evitar 'pulo' */}
            <div style={markdownStyles}>
                {isLoading && !completion && (
                    <div style={loadingStyle}>
                         <svg aria-hidden="true" /* ... svg ... */ style={{width: '30px', height: '30px', marginBottom: '10px'}} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
                        Analisando seu desafio e construindo a solução...
                    </div>
                )}
                {/* Renderiza o Markdown assim que ele começa a chegar (streaming) */}
                {completion && (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]} // Habilita tabelas, etc.
                        components={{
                            // Mapeia tags Markdown para componentes React com estilo
                            h2: ({node, ...props}) => <h2 style={h2Style} {...props} />,
                            ul: ({node, ...props}) => <ul style={ulStyle} {...props} />,
                            li: ({node, ...props}) => <li style={liStyle} {...props} />,
                            code: ({node, inline, ...props}) => <code style={codeStyle} {...props} />,
                            strong: ({node, ...props}) => <strong style={strongStyle} {...props} />,
                            // Adicione mais mapeamentos se necessário (ex: a, blockquote)
                        }}
                    >
                        {completion}
                    </ReactMarkdown>
                )}
                 {/* Mensagem Inicial */}
                 {!isLoading && !completion && !error && (
                      <div style={loadingStyle}>Seu Blueprint Estratégico aparecerá aqui.</div>
                 )}
            </div>
        </div>
    )
}

// Estilos (Ajustados para o Blueprint)
const containerStyle: React.CSSProperties = { width: "100%", fontFamily: "system-ui, sans-serif", color: "#E0E0E0", background: "#0A0A0A", padding: "30px 40px", boxSizing: 'border-box', minHeight: '100vh' };
const titleStyle: React.CSSProperties = { color: "#FFFFFF", fontSize: "2rem", fontWeight: 700, marginBottom: "10px", textAlign: 'center' };
const descriptionStyle: React.CSSProperties = { color: "#BDBDBD", fontSize: "1.1rem", marginBottom: "30px", textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 };
const textAreaStyle: React.CSSProperties = { width: "100%", minHeight: "80px", padding: "16px", background: "#181818", color: "#E0E0E0", border: "1px solid #444", borderRadius: "8px", fontFamily: "sans-serif", fontSize: "1rem", boxSizing: "border-box", resize: 'vertical', marginBottom: '10px' };
const buttonStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#3EFF9B", color: "#0A0A0A", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold", transition: 'opacity 0.2s' };
const loadingStyle: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#888", fontSize: "1rem", minHeight: '200px' }; // Sem position absolute
const errorStyle: React.CSSProperties = { color: '#FF6B6B', marginTop: '20px', whiteSpace: 'pre-wrap', border: '1px solid #FF6B6B', padding: '15px', borderRadius: '4px', background: 'rgba(255, 107, 107, 0.1)' };
