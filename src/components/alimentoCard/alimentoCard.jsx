import React from 'react';
import './alimentoCard.css'; // Importa o CSS do card

// Recebe a nova prop 'onCardClick'
function AlimentoCard({ alimento, onCardClick }) {

    // Formata a data de "AAAA-MM-DDTHH:mm:ss.sssZ" para "DD/MM/AA"
    const formatarData = (dataISO) => {
        try {
            const [dataParte] = dataISO.split('T'); // Pega "AAAA-MM-DD"
            const [ano, mes, dia] = dataParte.split('-');
            return `${dia}/${mes}/${ano.slice(-2)}`; // Retorna "DD/MM/AA"
        } catch (e) {
            console.error("Erro ao formatar data:", dataISO, e);
            return "Data inválida";
        }
    };

    const prazoFormatado = formatarData(alimento.data_de_validade);
    
    return (
        // Adiciona o onClick e passa o 'alimento'
        <div className="card-container" onClick={() => onCardClick(alimento)}>
            
            {/* 1. Imagem (Esquerda) */}
            <div className="imagem-container">
                <img src={alimento.imagem} alt={`Imagem de ${alimento.nome}`} />
            </div>

            {/* 2. Informações (Centro) */}
            <div className="info-container">
                <h3>{alimento.nome}</h3>
                <p>Prazo: {prazoFormatado}</p>
                
                {/* Só renderiza se a info da empresa existir */}
                {alimento.empresa && (
                    <div className="empresa-info">
                        <img 
                            src={alimento.empresa.logo_url} // Ajuste este campo se necessário
                            alt={`Logo ${alimento.empresa.nome}`} 
                        />
                        <span>{alimento.empresa.nome}</span>
                    </div>
                )}
            </div>
            
            {/* 3. Quantidade (Direita) */}
            <div className="quantidade-container">
                <p>Qnt: {alimento.quantidade}</p>
            </div>

        </div>
    );
}

export default AlimentoCard;