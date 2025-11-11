import React from 'react'
import './ModalAlimento.css'; // CSS específico para o modal

function ModalAlimento({ alimento, onClose }) {

    // Formata a data para "DD/MM/AAAA" (como na imagem de referência)
    const formatarDataModal = (dataISO) => {
        if (!dataISO) return "Data inválida";
        try {
            const [dataParte] = dataISO.split('T'); 
            const [ano, mes, dia] = dataParte.split('-');
            return `${dia}/${mes}/${ano}`; // Retorna "DD/MM/AAAA"
        } catch (e) {
            console.error("Erro ao formatar data:", dataISO, e);
            return "Data inválida";
        }
    };

    const prazoFormatado = formatarDataModal(alimento.data_de_validade);

    // Função para parar a propagação e não fechar o modal ao clicar dentro dele
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    // Mapeia as categorias (garante que seja um array)
    const categoriasTags = Array.isArray(alimento.categorias) ? alimento.categorias : [];

    return (
        // O Overlay que fecha o modal ao clicar
        <div className="modal-overlay" onClick={onClose}>
            
            {/* O contêiner do modal que previne o fechamento */}
            <div className="modal-container" onClick={handleModalClick}>
                
                {/* Botão de Fechar */}
                <button className="modal-close-button" onClick={onClose}>
                    &times; {/* Um 'X' simples */}
                </button>

                {/* Título */}
                <header className="modal-header">
                    <h2>{alimento.nome}</h2>
                </header>

                {/* Corpo principal (dividido) */}
                <main className="modal-body">
                    
                    {/* Coluna da Imagem */}
                    <div className="modal-imagem-col">
                        <img src={alimento.imagem} alt={`Imagem de ${alimento.nome}`} />
                    </div>

                    {/* Coluna de Informações */}
                    <div className="modal-info-col">
                        
                        {/* Bloco da Empresa */}
                        {alimento.empresa && (
                            <div className="modal-empresa-info">
                                <img 
                                    src={alimento.empresa.logo_url} 
                                    alt={`Logo ${alimento.empresa.nome}`} 
                                />
                                <span>{alimento.empresa.nome}</span>
                            </div>
                        )}

                        {/* Bloco de Detalhes */}
                        <div className="modal-detalhes">
                            <h3>Detalhes</h3>
                            <p><strong>Data de Validade:</strong> {prazoFormatado}</p>
                            <p><strong>Quantidade:</strong> {alimento.quantidade}</p>
                        </div>

                        {/* Bloco de Descrição */}
                        <div className="modal-descricao">
                            <h3>Descrição</h3>
                            <p>{alimento.descricao || "Nenhuma descrição fornecida."}</p>
                        </div>
                    </div>
                </main>

                {/* Rodapé com Categorias */}
                <footer className="modal-footer">
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
                </footer>

            </div>
        </div>
    );
}

export default ModalAlimento;