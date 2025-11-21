import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ModalAlimento.css';
import cart from "../../assets/icons/cart.png";
import menos from "../../assets/icons/menos.png";
import mais from "../../assets/icons/mais.png";

// Adicione a prop 'inline' aqui
function ModalAlimento({ alimento: alimentoBase, onClose, isPedidoPage = false, inline = false }) {

    const navigate = useNavigate();
    const [alimentoCompleto, setAlimentoCompleto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

    useEffect(() => {
        const fetchAlimento = async () => {
            const idParaBuscar = alimentoBase?.id || alimentoBase?.id_alimento;

            if (!idParaBuscar) {
                setError("Erro: ID do alimento não encontrado.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8080/v1/mesa-plus/alimento/${idParaBuscar}`);
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
    }, [alimentoBase]);

    // ... (Funções handleIncrement, handleDecrement, formatarDataModal, handleAddToCart mantêm-se IGUAIS) ...
    const handleIncrement = () => {
        const qtd = alimentoCompleto?.quantidade || 0;
        if (quantidadeSelecionada < qtd) setQuantidadeSelecionada(p => p + 1);
    };
    const handleDecrement = () => {
        if (quantidadeSelecionada > 1) setQuantidadeSelecionada(p => p - 1);
    };
    const formatarDataModal = (dataISO) => {
        if (!dataISO) return "Data inválida";
        try { return dataISO.split('T')[0].split('-').reverse().join('/'); } catch (e) { return "Data inválida"; }
    };
    const handleModalClick = (e) => e.stopPropagation();

    const handleAddToCart = async () => {
        // ... (Mantenha sua lógica de carrinho existente aqui) ...
        // Para economizar espaço na resposta, assumo que este bloco está igual ao seu original
        try {
             const userString = localStorage.getItem("user");
             const userType = localStorage.getItem("userType");
             if (!userString || (userType !== 'pessoa' && userType !== 'ong')) {
                 alert("Erro: Você precisa estar logado para adicionar ao carrinho.");
                 return;
             }
             const usuario = JSON.parse(userString);
             let payload = {};
             let redirectUrl = '';
             const url = 'http://localhost:8080/v1/mesa-plus/pedidoUsuario';

             if (userType === 'pessoa') {
                 payload = { id_usuario: usuario.id, id_alimento: alimentoCompleto.id, quantidade: quantidadeSelecionada };
                 redirectUrl = '/meusAlimentosUsuario';
             } else if (userType === 'ong') {
                 payload = { id_ong: usuario.id, id_alimento: alimentoCompleto.id, quantidade: quantidadeSelecionada };
                 redirectUrl = '/MeusAlimentosOng';
             }

             const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
             if (response.data && (response.data.status_code === 201 || response.data.status_code === 200)) {
                 alert("Alimento adicionado com sucesso!");
                 navigate(redirectUrl);
             } else {
                 throw new Error(response.data.message || "Erro ao adicionar ao carrinho.");
             }
         } catch (error) {
             console.error("Erro no handleAddToCart:", error);
             alert(`Erro: ${error.message}`);
         }
    };

    // Renderizações de Loading e Erro adaptadas para Inline
    if (loading) {
        if (inline) return <div className="modal-loading-inline">Carregando detalhes...</div>;
        return <div className="modal-overlay"><div className="modal-loading-feedback">Carregando...</div></div>;
    }

    if (error) {
        if (inline) return <div className="modal-error-inline">{error}</div>;
        return <div className="modal-overlay"><div className="modal-loading-feedback error">{error}<button onClick={onClose}>Fechar</button></div></div>;
    }

    const quantidadeDisponivel = alimentoCompleto.quantidade || 0;
    const prazoFormatado = formatarDataModal(alimentoCompleto.data_de_validade);
    const nomeAlimento = alimentoCompleto.nome;
    const nomeEmpresa = alimentoCompleto.empresa ? alimentoCompleto.empresa.nome : 'Empresa não informada';
    const fotoEmpresa = alimentoCompleto.empresa ? (alimentoCompleto.empresa.foto || alimentoCompleto.empresa.logo_url) : '';
    const categoriasTags = alimentoCompleto.categorias || [];
    const tipoPesoNome = (alimentoCompleto.tipoPeso && alimentoCompleto.tipoPeso[0]) ? alimentoCompleto.tipoPeso[0].tipo : 'N/A';
    const pesoCompleto = `${alimentoCompleto.peso || 'N/A'} ${tipoPesoNome}`;

    // Conteúdo do Modal (Extraído para usar nos dois modos)
    const modalContent = (
        <div className={`modal-container ${inline ? 'container-inline' : ''}`} onClick={handleModalClick}>
            <button className="modal-close-button" onClick={onClose}>&times;</button>
            <header className="modal-header"><h2>{nomeAlimento}</h2></header>
            <main className="modal-body">
                <div className="modal-imagem-col">
                    <img src={alimentoCompleto.imagem} alt={`Imagem de ${nomeAlimento}`} />
                </div>
                <div className="modal-info-col">
                    {nomeEmpresa && (
                        <div className="modal-empresa-info">
                            <img src={fotoEmpresa} alt={`Logo ${nomeEmpresa}`} />
                            <span>{nomeEmpresa}</span>
                        </div>
                    )}
                    <div className="modal-detalhes">
                        <h3>Detalhes</h3>
                        <p><strong>Validade:</strong> {prazoFormatado}</p>
                        <p><strong>Qtd:</strong> {quantidadeDisponivel}</p>
                        <p><strong>Peso:</strong> {pesoCompleto}</p>
                    </div>
                    <div className="modal-descricao">
                        <h3>Descrição</h3>
                        <p>{alimentoCompleto.descricao || "Nenhuma descrição."}</p>
                    </div>
                </div>
            </main>
            <footer className="modal-footer">
                <div className="footer-col categoria-col">
                    <h3>Categoria</h3>
                    <div className="tags-container">
                        {categoriasTags.length > 0 ? categoriasTags.map((cat, i) => <span key={i} className="tag">{cat.nome}</span>) : <span className="tag-none">N/C</span>}
                    </div>
                </div>
                {!isPedidoPage && (
                    <div className="footer-col carrinho-col">
                        <button className="add-to-cart-button" onClick={handleAddToCart}>
                            <img src={cart} alt="Cart" className="cart-icon" /> Adicionar
                        </button>
                        <div className="quantity-controls">
                            <button className="quantity-button" onClick={handleDecrement} disabled={quantidadeSelecionada === 1}><img src={menos} alt="-" /></button>
                            <span className="quantity-display">{quantidadeSelecionada}</span>
                            <button className="quantity-button" onClick={handleIncrement} disabled={quantidadeSelecionada === quantidadeDisponivel}><img src={mais} alt="+" /></button>
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );

    // Se for Inline, retorna sem overlay
    if (inline) {
        return <div className="modal-alimento-wrapper-inline">{modalContent}</div>;
    }

    return <div className="modal-overlay-alimento" onClick={onClose}>{modalContent}</div>;
}

export default ModalAlimento;