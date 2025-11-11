import React, { useState, useEffect } from 'react';

// Importação dos componentes
import NavbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import Filtrar from "../../components/filtros/filtrar";
import AlimentoCard from '../../components/alimentoCard/alimentoCard';
import Paginacao from '../../components/paginacaoCard/Paginacao';
import CarrosselEmpresa from '../../components/carrosselEmpresa/carrosselEmpresa';

// Importação do CSS da página
import './HomeUsuario.css'; 

function HomeUsuarioPage() {
    
    // [Seus estados e lógicas de fetch/paginação permanecem os mesmos]
    // ... (Estados, useEffect, renderContent)
    // Estados da API
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS DA PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4; 

    // Lógica para buscar dados (sem alteração)
    useEffect(() => {
        const fetchAlimentos = async () => {
            try {
                const response = await fetch('http://localhost:8080/v1/mesa-plus/alimentos'); 
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === true && Array.isArray(data.alimentos)) {
                    setAlimentos(data.alimentos);
                } else {
                    setAlimentos([]);
                }
            } catch (e) {
                setError(e.message);
                console.error("Falha ao buscar dados da API:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAlimentos();
    }, []); 

    // LÓGICA PARA CALCULAR ITENS DA PÁGINA ATUAL (sem alteração)
    const totalPages = Math.ceil(alimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAlimentos = alimentos.slice(startIndex, endIndex);

    // Função auxiliar para renderizar o conteúdo da direita (sem alteração)
    const renderContent = () => {
        if (loading) {
            return <div className="feedback-message">Carregando alimentos...</div>;
        }

        if (error) {
            return <div className="feedback-message">Erro ao carregar dados: {error}</div>;
        }

        if (alimentos.length === 0) {
            return <div className="feedback-message">Nenhum alimento cadastrado no momento.</div>;
        }

        return (
            <div className="lista-alimentos-grid">
                {currentAlimentos.map(alimento => (
                    <AlimentoCard 
                        key={alimento.id} 
                        alimento={alimento} 
                    />
                ))}
            </div>
        );
    };
    // ...
    // [Fim dos seus estados e lógicas]


    return (
        <>
            <NavbarUsuario />
            
            {/* ESTE É O WRAPPER QUE CONTÉM O FUNDO VERDE */}
            <div className="home-usuario-page-wrapper">

                {/* 1. CONTEÚDO PRINCIPAL (FILTROS + CARDS) */}
                <main className="home-usuario-container">

                    <aside className="coluna-filtros">
                        <Filtrar />
                    </aside>

                    <section className="coluna-conteudo">
                        
                        <h2 className="coluna-titulo">Empresas:</h2>
                        <CarrosselEmpresa />
                        
                        {renderContent()}

                    </section>
                </main>

                {/* 2. FOOTER COM A PAGINAÇÃO (DENTRO DO WRAPPER VERDE) */}
                <footer className="home-usuario-footer">
                    <Paginacao
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </footer>
                
            </div> {/* Fim do home-usuario-page-wrapper */}
        </>
    );
}

export default HomeUsuarioPage;