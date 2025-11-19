import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ModalAlimento.css';

// Importações dos ícones
import cart from "../../assets/icons/cart.png";
import menos from "../../assets/icons/menos.png";
import mais from "../../assets/icons/mais.png";

function ModalAlimento({ alimento: alimentoBase, onClose, isPedidoPage = false }) {

    const navigate = useNavigate();

    // --- ESTADOS (sem mudança) ---
    const [alimentoCompleto, setAlimentoCompleto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

    // --- useEffect (sem mudança) ---
    useEffect(() => {
        const fetchAlimento = async () => {
            if (!alimentoBase || !alimentoBase.id) {
                setError("Erro: ID do alimento não encontrado.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8080/v1/mesa-plus/alimento/${alimentoBase.id}`);

                if (response.data && response.data.status_code === 200 && response.data.alimento && response.data.alimento.length > 0) {
                    setAlimentoCompleto(response.data.alimento[0]);
                } else {
                    throw new Error(response.data.message || "Alimento não encontrado.");
                }
            } catch (err) {
                console.error("Erro ao buscar alimento:", err);
                setError(err.message || "Falha ao carregar dados.");
            } finally {
                setLoading(false);
            }
        };

        fetchAlimento();
    }, [alimentoBase.id]);

    // --- Funções de Formatação e Ação (sem mudança) ---
    const handleIncrement = () => {
        const quantidadeDisponivel = alimentoCompleto?.quantidade || 0;
        if (quantidadeSelecionada < quantidadeDisponivel) {
            setQuantidadeSelecionada(prev => prev + 1);
        }
    };
    const handleDecrement = () => {
        if (quantidadeSelecionada > 1) {
            setQuantidadeSelecionada(prev => prev - 1);
        }
    };
    const formatarDataModal = (dataISO) => {
        if (!dataISO) return "Data inválida";
        try {
            const [dataParte] = dataISO.split('T');
            const [ano, mes, dia] = dataParte.split('-');
            return `${dia}/${mes}/${ano}`;
        } catch (e) {
            return "Data inválida";
        }
    };
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    // ❗️ Ação carrinho (ATUALIZADA com redirecionamento dinâmico)
    const handleAddToCart = async () => {
        try {
            // 1. Pegar os dados do usuário
            const userString = localStorage.getItem("user");
            const userType = localStorage.getItem("userType");

            if (!userString || (userType !== 'pessoa' && userType !== 'ong')) {
                alert("Erro: Você precisa estar logado para adicionar ao carrinho.");
                return;
            }

            const usuario = JSON.parse(userString);

            // 2. Preparar Payload, URL e Redirecionamento
            let payload = {};
            let redirectUrl = ''; // ❗️ Definido dinamicamente abaixo
            const url = 'http://localhost:8080/v1/mesa-plus/pedidoUsuario';

            if (userType === 'pessoa') {
                // Payload para Usuário
                payload = {
                    id_usuario: usuario.id,
                    id_alimento: alimentoCompleto.id,
                    quantidade: quantidadeSelecionada
                };
                // ❗️ Redirecionamento de Usuário
                redirectUrl = '/meusAlimentosUsuario';

            } else if (userType === 'ong') {
                // Payload para ONG
                payload = {
                    id_ong: usuario.id,
                    id_alimento: alimentoCompleto.id,
                    quantidade: quantidadeSelecionada
                };
                // ❗️ Redirecionamento de ONG
                redirectUrl = '/MeusAlimentosOng';
            }

            // 3. Chamar a API
            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            // 4. Lidar com a resposta
            if (response.data && (response.data.status_code === 201 || response.data.status_code === 200)) {
                alert("Alimento adicionado com sucesso!");
                // ❗️ Usa a URL dinâmica
                navigate(redirectUrl);
            } else {
                throw new Error(response.data.message || "Erro ao adicionar ao carrinho.");
            }

        } catch (error) {
            console.error("Erro no handleAddToCart:", error);
            alert(`Erro: ${error.message || "Não foi possível adicionar ao carrinho."}`);
        }
    };

    // --- RENDERIZAÇÃO COM LOADING E ERRO (sem mudança) ---
    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={handleModalClick} style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-loading-feedback">Carregando dados atualizados...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={handleModalClick} style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className="modal-loading-feedback error">
                        <p>Erro ao carregar o alimento: {error}</p>
                        <button onClick={onClose} className="modal-close-button" style={{ position: 'static', marginTop: '20px', background: '#8B0000', color: 'white' }}>Fechar</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERIZAÇÃO NORMAL (sem mudança) ---
    const quantidadeDisponivel = alimentoCompleto.quantidade || 0;
    const prazoFormatado = formatarDataModal(alimentoCompleto.data_de_validade);
    const nomeAlimento = alimentoCompleto.nome;
    const nomeEmpresa = alimentoCompleto.empresa ? alimentoCompleto.empresa.nome : 'Empresa não informada';
    const fotoEmpresa = alimentoCompleto.empresa ? (alimentoCompleto.empresa.foto || alimentoCompleto.empresa.logo_url) : '';
    const categoriasTags = alimentoCompleto.categorias || [];
    const tipoPesoNome = (alimentoCompleto.tipoPeso && alimentoCompleto.tipoPeso[0])
        ? alimentoCompleto.tipoPeso[0].tipo
        : 'N/A';
    const pesoCompleto = `${alimentoCompleto.peso || 'N/A'} ${tipoPesoNome}`;


    return (
        <div className="modal-overlay-alimento" onClick={onClose}>
            <div className="modal-container" onClick={handleModalClick}>

                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <header className="modal-header">
                    <h2>{nomeAlimento}</h2>
                </header>

                <main className="modal-body">
                    <div className="modal-imagem-col">
                        <img src={alimentoCompleto.imagem} alt={`Imagem de ${nomeAlimento}`} />
                    </div>

                    <div className="modal-info-col">
                        {/* Bloco da Empresa */}
                        {nomeEmpresa && (
                            <div className="modal-empresa-info">
                                <img src={fotoEmpresa} alt={`Logo ${nomeEmpresa}`} />
                                <span>{nomeEmpresa}</span>
                            </div>
                        )}

                        {/* Bloco de Detalhes */}
                        <div className="modal-detalhes">
                            <h3>Detalhes</h3>
                            <p><strong>Data de Validade:</strong> {prazoFormatado}</p>
                            <p><strong>Quantidade Disponível:</strong> {quantidadeDisponivel}</p>
                            <p><strong>Peso:</strong> {pesoCompleto}</p>
                        </div>

                        {/* Bloco de Descrição */}
                        <div className="modal-descricao">
                            <h3>Descrição</h3>
                            <p>{alimentoCompleto.descricao || "Nenhuma descrição fornecida."}</p>
                        </div>
                    </div>
                </main>

                {/* 🆕 RENDERIZAÇÃO CONDICIONAL DO RODAPÉ */}
                {!isPedidoPage && (
                    <footer className="modal-footer">
                        {/* Coluna da Categoria */}
                        <div className="footer-col categoria-col">
                            <h3>Categoria</h3>
                            <div className="tags-container">
                                {categoriasTags.length > 0 ? (
                                    categoriasTags.map((cat, index) => (
                                        <span key={cat.id || index} className="tag">{cat.nome}</span>
                                    ))
                                ) : (
                                    <span className="tag-none">Não categorizado</span>
                                )}
                            </div>
                        </div>

                        {/* Coluna do Carrinho */}
                        <div className="footer-col carrinho-col">
                            <button className="add-to-cart-button" onClick={handleAddToCart}>
                                <img src={cart} alt="Carrinho" className="cart-icon" />
                                Adicionar ao carrinho
                            </button>
                            <div className="quantity-controls">
                                <button
                                    className="quantity-button"
                                    onClick={handleDecrement}
                                    disabled={quantidadeSelecionada === 1}
                                >
                                    <img src={menos} alt="Menos" />
                                </button>
                                <span className="quantity-display">{quantidadeSelecionada}</span>
                                <button
                                    source className="quantity-button"
                                    onClick={handleIncrement}
                                    disabled={quantidadeSelecionada === quantidadeDisponivel || quantidadeDisponivel === 0}
                                >
                                    <img src={mais} alt="Mais" />
                                </button>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}

export default ModalAlimento;