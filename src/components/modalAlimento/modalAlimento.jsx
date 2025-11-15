import React, { useState, useEffect } from 'react'; // Importei o useEffect
import axios from 'axios'; // Importei o axios para a chamada da API
import './ModalAlimento.css';

// Importações dos ícones
import cart from "../../assets/icons/cart.png";
import menos from "../../assets/icons/menos.png";
import mais from "../../assets/icons/mais.png";

// Recebemos 'alimento' (que usaremos como 'alimentoBase') e 'onClose'
function ModalAlimento({ alimento: alimentoBase, onClose }) {

    // --- NOVOS ESTADOS ---
    // 'alimentoCompleto' guardará os dados "frescos" vindos da API
    const [alimentoCompleto, setAlimentoCompleto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- FIM DOS NOVOS ESTADOS ---

    // Estado local para a quantidade (já existia)
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

    // --- NOVO useEffect ---
    // Isso roda assim que o modal é montado (pois 'alimentoBase.id' existe)
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
                // 1. CHAMA O ENDPOINT QUE VOCÊ PERGUNTOU
                const response = await axios.get(`http://localhost:8080/v1/mesa-plus/alimento/${alimentoBase.id}`);
                
                // 2. VERIFICA A RESPOSTA
                // A sua controller (controllerAlimentos.js) retorna { "alimento": [...] }
                if (response.data && response.data.status_code === 200 && response.data.alimento && response.data.alimento.length > 0) {
                    // 3. SALVA OS DADOS "FRESCOS" NO ESTADO
                    // Pegamos o primeiro item do array
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
    }, [alimentoBase.id]); // Roda toda vez que o ID do alimento mudar

    // --- Funções de Formatação e Ação (adaptadas) ---

    // Funções para manipular a quantidade
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

    // Formata a data para "DD/MM/AAAA"
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

    // Ação carrinho
  const handleAddToCart = async () => {
        try {
            // 1. Pegar os dados do usuário do localStorage
            const userString = localStorage.getItem("user");
            const userType = localStorage.getItem("userType");
            
            if (!userString || userType !== 'pessoa') {
                alert("Erro: Você precisa estar logado como usuário para adicionar ao carrinho.");
                return;
            }
            
            const usuario = JSON.parse(userString);
            
            // 2. Montar o payload (o que vamos enviar para a API)
            const payload = {
                id_usuario: usuario.id,
                id_alimento: alimentoCompleto.id,
                quantidade: quantidadeSelecionada
            };

            // 3. Chamar o endpoint POST para criar o pedido
            const response = await axios.post('http://localhost:8080/v1/mesa-plus/pedidoUsuario', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            // 4. Lidar com a resposta
            if (response.data && response.data.status_code === 201) {
                alert("Alimento adicionado com sucesso!");
                onClose(); // Fecha o modal
            } else {
                throw new Error(response.data.message || "Erro ao adicionar ao carrinho.");
            }

        } catch (error) {
            console.error("Erro no handleAddToCart:", error);
            alert(`Erro: ${error.message || "Não foi possível adicionar ao carrinho."}`);
        }
    };

    // --- RENDERIZAÇÃO COM LOADING E ERRO ---

    // 1. TELA DE LOADING ENQUANTO BUSCA NA API
    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={handleModalClick} style={{justifyContent: 'center', alignItems: 'center'}}>
                    <div className="modal-loading-feedback">Carregando dados atualizados...</div>
                </div>
            </div>
        );
    }

    // 2. TELA DE ERRO SE A API FALHAR
    if (error) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={handleModalClick} style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                    <div className="modal-loading-feedback error">
                        <p>Erro ao carregar o alimento: {error}</p>
                        <button onClick={onClose} className="modal-close-button" style={{position: 'static', marginTop: '20px', background: '#8B0000', color: 'white'}}>Fechar</button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. RENDERIZAÇÃO NORMAL (só acontece após o loading)
    // Se chegou aqui, 'alimentoCompleto' não é null
    
    // Variáveis agora usam 'alimentoCompleto'
    const quantidadeDisponivel = alimentoCompleto.quantidade || 0;
    const prazoFormatado = formatarDataModal(alimentoCompleto.data_de_validade);
    const nomeAlimento = alimentoCompleto.nome;
    
    // A sua API /alimento/:id retorna a empresa aninhada
    const nomeEmpresa = alimentoCompleto.empresa ? alimentoCompleto.empresa.nome : 'Empresa não informada';
    const fotoEmpresa = alimentoCompleto.empresa ? (alimentoCompleto.empresa.foto || alimentoCompleto.empresa.logo_url) : ''; // Ajuste conforme o nome do campo

    // A sua API /alimento/:id retorna 'categorias' como um array
    const categoriasTags = alimentoCompleto.categorias || [];
    
    // A sua API /alimento/:id retorna 'tipoPeso' como um array
    const tipoPesoNome = (alimentoCompleto.tipoPeso && alimentoCompleto.tipoPeso[0])
                         ? alimentoCompleto.tipoPeso[0].tipo
                         : 'N/A';
    const pesoCompleto = `${alimentoCompleto.peso || 'N/A'} ${tipoPesoNome}`;


    return (
        <div className="modal-overlay" onClick={onClose}>
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
                                className="quantity-button"
                                onClick={handleIncrement}
                                disabled={quantidadeSelecionada === quantidadeDisponivel || quantidadeDisponivel === 0}
                            >
                                <img src={mais} alt="Mais" />
                            </button>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
}

export default ModalAlimento;