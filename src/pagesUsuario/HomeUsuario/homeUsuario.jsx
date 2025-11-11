// 🆕 1. Importe o 'useCallback'
import React, { useState, useEffect, useCallback } from 'react';

// Importação dos componentes
import NavbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import Filtrar from "../../components/filtros/filtrar"; // Certifique-se que este é o 'Filtrar.jsx' com RADIO buttons
import AlimentoCard from '../../components/alimentoCard/alimentoCard';
import Paginacao from '../../components/paginacaoCard/Paginacao';
import CarrosselEmpresa from '../../components/carrosselEmpresa/carrosselEmpresa';
import ModalAlimento from '../../components/modalAlimento/modalAlimento';

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

    // ESTADOS DO MODAL
    const [modalOpen, setModalOpen] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

    // ESTADO PARA GUARDAR OS FILTROS ATIVOS
    const [filtrosAtivos, setFiltrosAtivos] = useState({
        categoriaId: null,
        // ... (outros filtros aqui)
    });

    // 🆕 2. FUNÇÃO "OUVINTE" MEMORIZADA COM 'useCallback'
    // Isso previne o loop infinito
    const handleFiltroChange = useCallback((filtros) => {
        setFiltrosAtivos(filtros);
        setCurrentPage(1); // Reseta a paginação ao mudar o filtro
    }, []); // O array de dependências vazio garante que esta função NUNCA mude

    
    // 🆕 3. USEEFFECT ATUALIZADO: "AGENTE" + "TRADUTOR"
    useEffect(() => {
        const fetchAlimentos = async () => {
            setLoading(true);
            setError(null);

            let url = '';
            const categoriaID = filtrosAtivos.categoriaId;

            if (categoriaID) {
                // Se tem um ID de categoria, usa o endpoint de filtro
                url = `http://localhost:8080/v1/mesa-plus/filtroCat/${categoriaID}`;
            } else {
                // Se não tem (é null), busca todos os alimentos
                url = 'http://localhost:8080/v1/mesa-plus/alimentos';
            }

            try {
                const response = await fetch(url); 
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const data = await response.json();
                
                if (data.status === true) {
                    
                    if (categoriaID && Array.isArray(data.resultFiltro)) {
                        // Resposta do /filtroCat/:id
                        // ❗️ AQUI É A "TRADUÇÃO" (Incompatibilidade de Dados Corrigida) ❗️
                        // Normalizamos os dados do filtro para o formato que o Card espera
                        const alimentosNormalizados = data.resultFiltro.map(item => ({
                            // Convertendo do formato do filtro (ex: 'nome_alimento')
                            // para o formato do Card (ex: 'nome')
                            id: item.id_alimento,                 // f0
                            nome: item.nome_alimento,             // f1
                            quantidade: item.quantidade,          // f2
                            peso: item.peso,                      // f3
                            id_tipo_peso: item.id_tipo_peso,      // f4
                            data_de_validade: item.data_de_validade, // f5
                            descricao: item.descricao,            // f6
                            imagem: item.imagem,                  // f7
                            
                            // Criando o objeto 'empresa' que o Card/Modal espera
                            empresa: { 
                                id: item.id_empresa,              // f8
                                nome: item.nome_empresa,          // f9
                                logo_url: item.foto_empresa       // f10
                            }
                        }));
                        setAlimentos(alimentosNormalizados); // Salva os dados já formatados

                    } else if (!categoriaID && Array.isArray(data.alimentos)) {
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
                    // 🆕 4. AGORA ISSO FUNCIONA SEMPRE!
                    // 'alimento.id' sempre existirá, pois normalizamos os dados.
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
                        {/* 🆕 5. Passa a função 'memorizada' para o filho */}
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

            {/* 🆕 6. O MODAL TAMBÉM FUNCIONA!
              Como normalizamos os dados antes, o ModalAlimento receberá
              'alimento.nome' e 'alimento.empresa', como ele espera.
              Você não precisa modificar o Modal.
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