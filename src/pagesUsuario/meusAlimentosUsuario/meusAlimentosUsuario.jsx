import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarUsuario from '../../components/navbarUsuario/navbarUsuario';
import AlimentoCard from '../../components/alimentoCard/alimentoCard';
import ModalAlimento from '../../components/modalAlimento/modalAlimento';
import '../homeUsuario/HomeUsuario.css'; 

function MeusAlimentosUsuarioPage() {
    
    const [meusPedidos, setMeusPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);

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

    // 🆕 FUNÇÃO PARA EXCLUIR O PEDIDO
    const handleDeletePedido = async (idPedido) => {
        // Confirmação para evitar exclusão acidental
        if (!window.confirm("Tem certeza que deseja remover este alimento dos seus pedidos?")) {
            return;
        }

        try {
            // 1. Chama a API DELETE
            const response = await axios.delete(`http://localhost:8080/v1/mesa-plus/pedido/${idPedido}`);

            if (response.data && response.data.status_code === 200) {
                alert("Pedido removido com sucesso!");

                // 2. Atualiza a tela IMEDIATAMENTE
                // Remove o item da lista 'meusPedidos' no estado
                setMeusPedidos(pedidosAtuais => 
                    pedidosAtuais.filter(pedido => pedido.id_pedido !== idPedido)
                );
            } else {
                throw new Error(response.data.message || "Erro ao excluir.");
            }
        } catch (err) {
            console.error("Erro ao excluir pedido:", err);
            alert(`Erro: ${err.message || "Não foi possível remover o pedido."}`);
        }
    };

    // Função de renderização (sem mudança)
    const renderContent = () => {
        if (loading) {
            return <div className="feedback-message">Carregando meus alimentos...</div>;
        }
        if (error) {
            return <div className="feedback-message">Erro ao carregar dados: {error}</div>;
        }
        if (meusPedidos.length === 0) {
            return <div className="feedback-message">Você ainda não adicionou nenhum alimento.</div>;
        }

        return (
            <div className="lista-alimentos-grid">
                {meusPedidos.map(pedido => (
                    <AlimentoCard
                        key={pedido.id_pedido}
                        alimento={pedido} 
                        onCardClick={handleCardClick}
                        onDeleteClick={handleDeletePedido} // 🆕 PASSANDO A FUNÇÃO DE EXCLUIR
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