import React from 'react';
import './alimentoCard.css'; 
import trash from '../../assets/icons/trash.png'; 
// 1. Importe a imagem padrão (igual você fez no modal)
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png'; 

function AlimentoCard({ alimento, onCardClick, onDeleteClick }) {

    const formatarData = (dataISO) => {
        try {
            if (!dataISO) return "---"; // Proteção contra null
            const [dataParte] = dataISO.split('T'); 
            const [ano, mes, dia] = dataParte.split('-');
            return `${dia}/${mes}/${ano.slice(-2)}`; 
        } catch (e) {
            return "Data inválida";
        }
    };
    
    const prazoFormatado = formatarData(alimento.data_de_validade);

    // 2. CORREÇÃO AQUI: 
    // Verifique 'foto', 'logo_url', 'foto_empresa' e 'imagem'. 
    // O operador ?. (optional chaining) evita erro se 'empresa' for null.
    const nomeEmpresa = alimento.empresa?.nome || alimento.nome_empresa;
    
    const logoEmpresa = 
        alimento.empresa?.foto ||       // Tenta .foto (usado no Modal)
        alimento.empresa?.logo_url ||   // Tenta .logo_url
        alimento.foto_empresa ||        // Tenta foto_empresa (flat)
        userDefaultEmpresa;             // Se nada existir, usa o padrão


    const handleDelete = (e) => {
        e.stopPropagation(); 
        onDeleteClick(alimento.id_pedido); 
    };
    
    return (
        <div className="card-container" onClick={() => onCardClick(alimento)}>
            
            <div className="imagem-container">
                <img src={alimento.imagem} alt={`Imagem de ${alimento.nome || alimento.nome_alimento}`} />
            </div>

            <div className="info-container">
                <h3>{alimento.nome || alimento.nome_alimento}</h3>
                
                <p>Validade: {prazoFormatado}</p>
                
                {nomeEmpresa && (
                    <div className="empresa-info">
                        <img 
                            src={logoEmpresa}
                            alt={`Logo ${nomeEmpresa}`} 
                            // 3. MELHORIA NO ONERROR:
                            // Em vez de 'display: none' (que faz sumir), coloca a imagem padrão
                            onError={(e) => { 
                                e.target.onerror = null; // Previne loop infinit
                                e.target.src = userDefaultEmpresa; 
                            }}
                        />
                        <span>{nomeEmpresa}</span>
                    </div>
                )}
            </div>
            
            <div className="quantidade-container">
                <p>Qnt: {alimento.quantidade_pedido || alimento.quantidade}</p>
            </div>

            {onDeleteClick && (
                <button className="card-delete-button" onClick={handleDelete}>
                    <img src={trash} alt="Excluir Pedido" />
                </button>
            )}

        </div>
    );
}

export default AlimentoCard;