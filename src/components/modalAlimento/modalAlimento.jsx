import React, { useState } from 'react'; // Adicionei useState para gerenciar a quantidade
import './ModalAlimento.css'; 

// Importações dos ícones (Assumindo que eles estão no caminho: ../../assets/icons/)
import cart from "../../assets/icons/cart.png";
import menos from "../../assets/icons/menos.png";
import mais from "../../assets/icons/mais.png";

function ModalAlimento({ alimento, onClose }) {

    // Estado local para a quantidade a ser adicionada ao carrinho
    const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1); 

    // Limite máximo é a quantidade disponível do alimento
    const quantidadeDisponivel = alimento.quantidade || 0; 

    // Funções para manipular a quantidade
    const handleIncrement = () => {
        if (quantidadeSelecionada < quantidadeDisponivel) {
            setQuantidadeSelecionada(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (quantidadeSelecionada > 1) { // Garante que a quantidade mínima seja 1
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
            console.error("Erro ao formatar data:", dataISO, e);
            return "Data inválida";
        }
    };

    const prazoFormatado = formatarDataModal(alimento.data_de_validade);

    const handleModalClick = (e) => {
        e.stopPropagation();
    };
    
    const categoriasTags = Array.isArray(alimento.categorias) ? alimento.categorias : [];
    
    const tipoPeso = alimento.tipoPeso && alimento.tipoPeso[0] ? alimento.tipoPeso[0].tipo : 'N/A';
    const pesoCompleto = `${alimento.peso || 'N/A'} ${tipoPeso}`;

    // Ação fictícia do carrinho (você implementará a lógica real depois)
    const handleAddToCart = () => {
        console.log(`Adicionando ${quantidadeSelecionada}x de ${alimento.nome} ao carrinho.`);
        // Lógica de adição ao carrinho real aqui
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            
            <div className="modal-container" onClick={handleModalClick}>
                
                <button className="modal-close-button" onClick={onClose}>
                    &times;
                </button>

                <header className="modal-header">
                    <h2>{alimento.nome}</h2>
                </header>

                <main className="modal-body">
                    
                    <div className="modal-imagem-col">
                        <img src={alimento.imagem} alt={`Imagem de ${alimento.nome}`} />
                    </div>

                    <div className="modal-info-col">
                        
                        {/* Bloco da Empresa */}
                        {alimento.empresa && (
                            <div className="modal-empresa-info">
                                <img 
                                    src={alimento.empresa.foto || alimento.empresa.logo_url}
                                    alt={`Logo ${alimento.empresa.nome}`} 
                                />
                                <span>{alimento.empresa.nome}</span>
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
                            <p>{alimento.descricao || "Nenhuma descrição fornecida."}</p>
                        </div>
                    </div>
                </main>

                {/* Rodapé com Categorias e Carrinho */}
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

                    {/* Coluna do Carrinho (NOVO BLOCO) */}
                    <div className="footer-col carrinho-col">
                        <button className="add-to-cart-button" onClick={handleAddToCart}>
                            <img src={cart} alt="Carrinho" className="cart-icon" />
                            Adicionar ao carrinho
                        </button>
                        <div className="quantity-controls">
                            <button 
                                className="quantity-button" 
                                onClick={handleDecrement}
                                disabled={quantidadeSelecionada === 1} // Desabilita se for 1
                            >
                                <img src={menos} alt="Menos" />
                            </button>
                            <span className="quantity-display">{quantidadeSelecionada}</span>
                            <button 
                                className="quantity-button" 
                                onClick={handleIncrement}
                                disabled={quantidadeSelecionada === quantidadeDisponivel || quantidadeDisponivel === 0} // Desabilita se for o limite
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