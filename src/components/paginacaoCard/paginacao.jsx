import React from 'react';
import './paginacao.css'; // O CSS atualizado

/**
 * Componente de Paginação com números
 * @param {object} props
 * @param {number} props.currentPage - A página atual.
 * @param {number} props.totalPages - O número total de páginas.
 * @param {function} props.onPageChange - Função para mudar de página.
 */
function Paginacao({ currentPage, totalPages, onPageChange }) {

    // Não renderiza nada se houver apenas uma página
    if (totalPages <= 1) {
        return null;
    }

    // Cria um array de números [1, 2, 3, ..., totalPages]
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="paginacao-container">
            
            {/* Botão Anterior (<) */}
            <button 
                className="paginacao-btn arrow" // Classe 'arrow' para estilo distinto
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior" // Acessibilidade
            >
                &lt; {/* Símbolo < */}
            </button>

            {/* Números das Páginas (Bolinhas) */}
            {pageNumbers.map(number => (
                <button
                    key={number}
                    className={`paginacao-btn number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => onPageChange(number)}
                    aria-label={`Ir para página ${number}`} // Acessibilidade
                >
                    {number}
                </button>
            ))}

            {/* Botão Próximo (>) */}
            <button 
                className="paginacao-btn arrow" // Classe 'arrow'
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página" // Acessibilidade
            >
                &gt; {/* Símbolo > */}
            </button>
            
        </div>
    );
}

export default Paginacao;