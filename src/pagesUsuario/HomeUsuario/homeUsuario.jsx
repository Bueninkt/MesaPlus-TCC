// 🔄 Arquivo: HomeUsuarioPage.jsx (Atualizado com formatação de data no Frontend)
import React, { useState, useEffect, useCallback } from 'react';

//Importação dos componentes
import NavbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import Filtrar from "../../components/filtros/filtrar";
import AlimentoCard from '../../components/AlimentoCard/AlimentoCard';
import Paginacao from '../../components/PaginacaoCard/Paginacao';
import CarrosselEmpresa from '../../components/carrosselEmpresa/carrosselEmpresa';
import ModalAlimento from '../../components/ModalAlimento/ModalAlimento';

import './HomeUsuario.css';

function HomeUsuarioPage() {

   
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;
    const [modalOpen, setModalOpen] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
    const [filtrosAtivos, setFiltrosAtivos] = useState({
        categoriaId: null,
        empresaId: null,
        dataVencimento: '',
    });

   
    const handleFiltroChange = useCallback((filtros) => {
        setFiltrosAtivos(filtros);
        setCurrentPage(1);
    }, []);


    useEffect(() => {
        const fetchAlimentos = async () => {
            setLoading(true);
            setError(null);

            let url = '';

            const { categoriaId: categoriaID, empresaId: empresaID, dataVencimento } = filtrosAtivos;

            
            let dataFormatadaParaAPI = '';
            if (dataVencimento) { 
                const [ano, mes, dia] = dataVencimento.split('-');
                dataFormatadaParaAPI = `${dia}-${mes}-${ano}`; 
            }
            
            if (empresaID) {
                url = `http://localhost:8080/v1/mesa-plus/empresaAlimento/${empresaID}`;
            } else if (categoriaID) {
                url = `http://localhost:8080/v1/mesa-plus/filtroCat/${categoriaID}`;
            } else if (dataFormatadaParaAPI) { 
                url = `http://localhost:8080/v1/mesa-plus/filtroData?data=${dataFormatadaParaAPI}`;
            } else {
                url = 'http://localhost:8080/v1/mesa-plus/alimentos';
            }

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = await response.json();

                if (data.status === true) {

              
                    if ((categoriaID || empresaID || dataFormatadaParaAPI) && Array.isArray(data.resultFiltro)) {
                        
                        const alimentosNormalizados = data.resultFiltro.map(item => ({
                            id: item.id_alimento,
                            nome: item.nome_alimento,
                            quantidade: item.quantidade,
                            peso: item.peso,
                            id_tipo_peso: item.id_tipo_peso,
                            tipo_peso_nome: item.tipo,
                            data_de_validade: item.data_de_validade,
                            descricao: item.descricao,
                            imagem: item.imagem,
                            empresa: {
                                id: item.id_empresa,
                                nome: item.nome_empresa,
                                logo_url: item.foto_empresa
                            },
                            nome_categoria: item.nome_categoria
                        }));
                        setAlimentos(alimentosNormalizados);

                    } else if (!categoriaID && !empresaID && !dataFormatadaParaAPI && Array.isArray(data.alimentos)) {
                
                        setAlimentos(data.alimentos);
                    } else {
                        setAlimentos([]); 
                    }
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
    }, [filtrosAtivos]); 


    const totalPages = Math.ceil(alimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAlimentos = alimentos.slice(startIndex, endIndex);

    
    const handleCardClick = (alimento) => {
        setAlimentoSelecionado(alimento);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAlimentoSelecionado(null);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="feedback-message">Carregando alimentos...</div>;
        }

        if (error) {
            return <div className="feedback-message">Erro ao carregar dados: {error}</div>;
        }

        if (alimentos.length === 0) {
            return <div className="feedback-message">Nenhum alimento encontrado.</div>;
        }

        return (
            <div className="lista-alimentos-grid">
                {currentAlimentos.map(alimento => (
                    <AlimentoCard
                        key={alimento.id}
                        alimento={alimento}
                        onCardClick={handleCardClick}
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
                        <Filtrar onFilterChange={handleFiltroChange} />
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