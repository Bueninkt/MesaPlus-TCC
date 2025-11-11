import React, { useState, useEffect } from 'react';

// Importação dos componentes
import NavbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import Filtrar from "../../components/filtros/filtrar";
import AlimentoCard from '../../components/alimentoCard/alimentoCard';
import Paginacao from '../../components/paginacaoCard/Paginacao';
import CarrosselEmpresa from '../../components/carrosselEmpresa/carrosselEmpresa';
import ModalAlimento from '../../components/modalAlimento/modalAlimento'; // <-- IMPORTADO

// Importação do CSS da página
import './HomeUsuario.css'; 

function HomeUsuarioPage() {
    
    // Estados da API
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS DA PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4; 

    // ESTADOS DO MODAL (NOVOS)
    const [modalOpen, setModalOpen] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

    // Lógica para buscar dados (Seu useEffect original)
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

    // LÓGICA PARA CALCULAR ITENS DA PÁGINA ATUAL
    const totalPages = Math.ceil(alimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAlimentos = alimentos.slice(startIndex, endIndex);

    // FUNÇÕES DO MODAL (NOVAS)
    const handleCardClick = (alimento) => {
        setAlimentoSelecionado(alimento);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAlimentoSelecionado(null);
    };

    // Função auxiliar para renderizar o conteúdo da direita (modificada)
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
                        onCardClick={handleCardClick} // <-- PROP ADICIONADA
                    />
                ))}
            </div>
        );
    };
    
    return (
        <>
            <NavbarUsuario />
            
            <div className="home-usuario-page-wrapper">

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

                <footer className="home-usuario-footer">
                    <Paginacao
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </footer>
                
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL DO MODAL (NOVO) */}
            {modalOpen && alimentoSelecionado && (
                <ModalAlimento 
                    alimento={alimentoSelecionado} 
                    onClose={handleCloseModal} 
                />
            )}
        </>
    );
}

export default HomeUsuarioPage;