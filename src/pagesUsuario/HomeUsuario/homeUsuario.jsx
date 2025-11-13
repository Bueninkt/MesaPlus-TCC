// 🔄 Arquivo: HomeUsuarioPage.jsx
import React, { useState, useEffect, useCallback } from 'react';

// Importação dos componentes
import NavbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import Filtrar from "../../components/filtros/filtrar";
import AlimentoCard from '../../components/alimentoCard/alimentoCard';
import Paginacao from '../../components/paginacaoCard/Paginacao';
import CarrosselEmpresa from '../../components/carrosselEmpresa/carrosselEmpresa';
import ModalAlimento from '../../components/modalAlimento/modalAlimento';

import './HomeUsuario.css';

function HomeUsuarioPage() {

    // Estados da API
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS DA PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    // ESTADOS DO MODAL
    const [modalOpen, setModalOpen] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

    // ESTADO PARA GUARDAR OS FILTROS ATIVOS
    const [filtrosAtivos, setFiltrosAtivos] = useState({
        categoriaId: null,
        empresaId: null, // 🆕 NOVO: 'Ouvindo' o filtro de empresa
        // ... (outros filtros aqui)
    });

    // 2. FUNÇÃO "OUVINTE" (sem mudanças, já está correta com useCallback)
    const handleFiltroChange = useCallback((filtros) => {
        setFiltrosAtivos(filtros);
        setCurrentPage(1); // Reseta a paginação ao mudar o filtro
    }, []);


    // 🔄 3. USEEFFECT ATUALIZADO (Lógica de API com Prioridade)
    useEffect(() => {
        const fetchAlimentos = async () => {
            setLoading(true);
            setError(null);

            let url = '';
            // 🆕 Lê os dois IDs
            const categoriaID = filtrosAtivos.categoriaId;
            const empresaID = filtrosAtivos.empresaId; // 🆕

            // 🆕 Lógica de prioridade
            if (empresaID) {
                // 1. Prioridade: Filtro de Empresa
                url = `http://localhost:8080/v1/mesa-plus/empresaAlimento/${empresaID}`;
            } else if (categoriaID) {
                // 2. Se não, filtro de Categoria
                url = `http://localhost:8080/v1/mesa-plus/filtroCat/${categoriaID}`;
            } else {
                // 3. Se não, busca todos
                url = 'http://localhost:8080/v1/mesa-plus/alimentos';
            }

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = await response.json();

                if (data.status === true) {

                    // 🔄 CONDIÇÃO DE "TRADUÇÃO" ATUALIZADA
                    // Agora, se *qualquer* filtro (Cat ou Empresa) estiver ativo
                    // e a resposta for 'resultFiltro', ele normaliza.
                    // Isso funciona porque AMBOS os seus endpoints de filtro (filtroCat e empresaAlimento)
                    // retornam os dados como f0, f1, f2...
                    if ((categoriaID || empresaID) && Array.isArray(data.resultFiltro)) {
                        // Resposta do /filtroCat/:id OU /empresaAlimento/:id
                        const alimentosNormalizados = data.resultFiltro.map(item => ({
                            id: item.id_alimento, // f0
                            nome: item.nome_alimento, // f1
                            quantidade: item.quantidade, // f2
                            peso: item.peso, // f3
                            id_tipo_peso: item.id_tipo_peso, // f4
                            tipo_peso_nome: item.tipo, // f5 (seu SQL chama de tipoPeso, mas o f5 é 'tipo')
                            data_de_validade: item.data_de_validade, // f6
                            descricao: item.descricao, // f7
                            imagem: item.imagem, // f8
                            empresa: {
                                id: item.id_empresa, // f9
                                nome: item.nome_empresa, // f10
                                logo_url: item.foto_empresa // f11
                            },
                            // f12 (nome_categoria) só vem do /filtroCat,
                            // mas não tem problema estar null se for filtro de empresa
                            nome_categoria: item.nome_categoria // f12
                        }));
                        setAlimentos(alimentosNormalizados);

                        // 🔄 CONDIÇÃO "TODOS" ATUALIZADA
                        // Só entra aqui se NENHUM filtro estiver ativo
                    } else if (!categoriaID && !empresaID && Array.isArray(data.alimentos)) {
                        // Resposta do /alimentos (já está no formato correto)
                        setAlimentos(data.alimentos);
                    } else {
                        setAlimentos([]); // Resposta válida, mas sem dados
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
    }, [filtrosAtivos]); // Roda este efeito sempre que os filtros mudarem


    // LÓGICA PARA CALCULAR ITENS DA PÁGINA ATUAL
    const totalPages = Math.ceil(alimentos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAlimentos = alimentos.slice(startIndex, endIndex);

    // FUNÇÕES DO MODAL
    const handleCardClick = (alimento) => {
        setAlimentoSelecionado(alimento);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAlimentoSelecionado(null);
    };

    // Função auxiliar para renderizar o conteúdo da direita
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

            {/*               O Modal, AlimentoCard e o SQL já estão corretos. 
              A "normalização" que fizemos na HomeUsuarioPage garante que 
              os dados cheguem no formato que eles esperam, 
              independentemente da rota da API (filtros ou /alimentos).
            */}
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