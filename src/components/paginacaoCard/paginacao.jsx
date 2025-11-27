import React from 'react';
import './paginacao.css'; 


function Paginacao({ currentPage, totalPages, onPageChange }) {

    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="paginacao-container">
            
            <button 
                className="paginacao-btn arrow" 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior" 
            >
                &lt; 
            </button>

            
            {pageNumbers.map(number => (
                <button
                    key={number}
                    className={`paginacao-btn number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => onPageChange(number)}
                    aria-label={`Ir para página ${number}`} 
                >
                    {number}
                </button>
            ))}

            <button 
                className="paginacao-btn arrow" 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página" 
            >
                &gt; 
            </button>
            
        </div>
    );
}

export default Paginacao;