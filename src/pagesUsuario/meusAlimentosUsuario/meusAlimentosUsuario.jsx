import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarUsuario from '../../components/navbarUsuario/navbarUsuario';
import AlimentoCard from '../../components/alimentoCard/alimentoCard';
import ModalAlimento from '../../components/modalAlimento/modalAlimento';
import Paginacao from '../../components/paginacaoCard/paginacao'; // 🆕 IMPORTADO

function MeusAlimentosUsuarioPage() {

    const [meusPedidos, setMeusPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

    // 🆕 ESTADOS DA PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4; // Define 4 itens por página

    // useEffect para buscar pedidos (sem mudança)
    useEffect(() => {
        const fetchMeusPedidos = async () => {
            try {
                const userString = localStorage.getItem("user");
                const userType = localStorage.getItem("userType");
                if (!userString || userType !== 'pessoa') {
                    throw new Error("Usuário não autenticado.");
                }
                const usuario = JSON.parse(userString);

                const response = await axios.get(`http://localhost:8080/v1/mesa-plus/pedido?id_usuario=${usuario.id}`);

                if (response.data && response.data.status_code === 200) {
                    setMeusPedidos(response.data.result);
                } else {
                    throw new Error(response.data.message || "Não foi possível buscar os pedidos.");
                }
            } catch (err) {
                setError(err.message);
                setMeusPedidos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMeusPedidos();
    }, []);

    // Funções do Modal (sem mudança)
    const handleCardClick = (alimento) => {
        const alimentoParaModal = {
            id: alimento.id_alimento,
            ...alimento
        };
        setAlimentoSelecionado(alimentoParaModal);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAlimentoSelecionado(null);
    };

    // 🆕 FUNÇÃO PARA EXCLUIR O PEDIDO (ATUALIZADA)
    const handleDeletePedido = async (idPedido) => {
        if (!window.confirm("Tem certeza que deseja remover este alimento dos seus pedidos?")) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:8080/v1/mesa-plus/pedido/${idPedido}`);

            if (response.data && response.data.status_code === 200) {
                alert("Pedido removido com sucesso!");

                // 2. Atualiza a tela E checa a paginação
                setMeusPedidos(pedidosAtuais => {
                    const novosPedidos = pedidosAtuais.filter(pedido => pedido.id_pedido !== idPedido);

                    // 🆕 Checagem de paginação após exclusão
                    const newTotalPages = Math.ceil(novosPedidos.length / ITEMS_PER_PAGE);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages); // Volta para a última página válida
                    } else if (novosPedidos.length === 0) {
                        setCurrentPage(1); // Volta para a página 1 se tudo for excluído
                    }

                    return novosPedidos; // Atualiza o estado
                });
            } else {
                throw new Error(response.data.message || "Erro ao excluir.");
            }
        } catch (err) {
            console.error("Erro ao excluir pedido:", err);
            alert(`Erro: ${err.message || "Não foi possível remover o pedido."}`);
        }
    };

    // 🆕 LÓGICA PARA CALCULAR ITENS DA PÁGINA ATUAL
    const totalPages = Math.ceil(meusPedidos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    // 🆕 Slice da lista de pedidos para a página atual
    const currentPedidos = meusPedidos.slice(startIndex, endIndex);

    // 🆕 Função de renderização (ATUALIZADA)
    const renderContent = () => {
        if (loading) {
            return <div className="feedback-message">Carregando meus alimentos...</div>;
        }
        if (error) {
            return <div className="feedback-message">Você ainda não adicionou nenhum alimento.</div>;
        }
        if (meusPedidos.length === 0) {
            return <div className="feedback-message">Você ainda não adicionou nenhum alimento.</div>;
        }

        return (
            <div className="lista-alimentos-grid">
                {/* ❗️ Mapeia 'currentPedidos' em vez de 'meusPedidos' */}
                {currentPedidos.map(pedido => (
                    <AlimentoCard
                        key={pedido.id_pedido}
                        alimento={pedido}
                        onCardClick={handleCardClick}
                        onDeleteClick={handleDeletePedido}
                    />
                ))}
            </div>
        );
    };

    // Return (JSX)
    return (
        <>
            <NavbarUsuario />
            <div className="home-usuario-page-wrapper" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <main className="home-usuario-container" style={{ display: 'block', width: '90%', margin: '20px auto' }}>
                    <section className="coluna-conteudo" style={{ width: '100%' }}>
                        <h1 className="coluna-titulo" style={{ fontSize: '2.5rem', color: 'white', marginBottom: '30px' }}>
                            Meus Alimentos:
                        </h1>
                        {renderContent()}
                    </section>
                </main>

                {/* 🆕 ÁREA DE PAGINAÇÃO ADICIONADA */}
                <footer className="home-usuario-footer" style={{ padding: '20px 0' }}>
                    <Paginacao
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </footer>
            </div>

            {/* Modal (sem mudança) */}
            {modalOpen && alimentoSelecionado && (
                <ModalAlimento
                    alimento={alimentoSelecionado}
                    onClose={handleCloseModal}
                    isPedidoPage={true}
                />
            )}
        </>
    );
}

export default MeusAlimentosUsuarioPage;