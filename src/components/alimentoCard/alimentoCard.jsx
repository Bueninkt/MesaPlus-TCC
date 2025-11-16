import React from 'react';
import './alimentoCard.css'; 

// 🆕 Importe um ícone de lixeira (ou use um emoji/texto)
import trash from '../../assets/icons/trash.png'; // 🆕 (Exemplo, ajuste o caminho)

// 🆕 Recebe a nova prop 'onDeleteClick'
function AlimentoCard({ alimento, onCardClick, onDeleteClick }) {

    // ... (função formatarData continua igual)
    const formatarData = (dataISO) => {
        try {
            const [dataParte] = dataISO.split('T'); 
            const [ano, mes, dia] = dataParte.split('-');
            return `${dia}/${mes}/${ano.slice(-2)}`; 
        } catch (e) {
            return "Data inválida";
        }
    };
    
    const prazoFormatado = formatarData(alimento.data_de_validade);
    const nomeEmpresa = alimento.empresa ? alimento.empresa.nome : alimento.nome_empresa;
    const logoEmpresa = alimento.empresa ? alimento.empresa.logo_url : alimento.foto_empresa;

    // 🆕 Função de clique para parar a propagação
    // Evita que ao clicar na lixeira, o modal abra.
    const handleDelete = (e) => {
        e.stopPropagation(); // Para o clique aqui
        onDeleteClick(alimento.id_pedido); // Chama a função de excluir
    };
    
    return (
        // 🆕 Passa o clique do card para a div principal
        <div className="card-container" onClick={() => onCardClick(alimento)}>
            
            <div className="imagem-container">
                <img src={alimento.imagem} alt={`Imagem de ${alimento.nome || alimento.nome_alimento}`} />
            </div>

            <div className="info-container">
                <h3>{alimento.nome || alimento.nome_alimento}</h3>
                <p>Prazo: {prazoFormatado}</p>
                
                {nomeEmpresa && (
                    <div className="empresa-info">
                        <img 
                            src={logoEmpresa}
                            alt={`Logo ${nomeEmpresa}`} 
                        />
                        <span>{nomeEmpresa}</span>
                    </div>
                )}
            </div>
            
            <div className="quantidade-container">
                {/* Esta é a correção que fizemos antes, mostrando a 
                  quantidade do PEDIDO (ex: 2) ou o estoque (ex: 45) 
                */}
                <p>Qnt: {alimento.quantidade_pedido || alimento.quantidade}</p>
            </div>

            {/* 🆕 BOTÃO DE EXCLUIR CONDICIONAL */}
            {/* Ele só aparece se a prop 'onDeleteClick' for passada */}
            {onDeleteClick && (
                <button className="card-delete-button" onClick={handleDelete}>
                    {/* Use um ícone ou um "X" */}
                    <img src={trash} alt="Excluir Pedido" />
                </button>
            )}

        </div>
    );
}

export default AlimentoCard;