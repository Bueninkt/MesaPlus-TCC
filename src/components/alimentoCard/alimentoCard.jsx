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

    
    // 🆕 Usa 'data_de_validade' (que é igual em ambas as rotas)
    const prazoFormatado = formatarData(alimento.data_de_validade);
    
    // 🆕 Lógica para pegar os dados da empresa de AMBAS as respostas
    const nomeEmpresa = alimento.empresa ? alimento.empresa.nome : alimento.nome_empresa;
    const logoEmpresa = alimento.empresa ? alimento.empresa.logo_url : alimento.foto_empresa;
    
    return (
        <div className="card-container" onClick={() => onCardClick(alimento)}>
            
            <div className="imagem-container">
                {/* 🆕 Usa 'imagem' (que é igual em ambas as rotas) */}
                <img src={alimento.imagem} alt={`Imagem de ${alimento.nome || alimento.nome_alimento}`} />
            </div>

            <div className="info-container">
                {/* 🆕 CORREÇÃO DE DADOS: Lê 'nome' OU 'nome_alimento' */}
                <h3>{alimento.nome || alimento.nome_alimento}</h3>
                <p>Prazo: {prazoFormatado}</p>
                
                {/* 🆕 CORREÇÃO DE DADOS: Verifica se 'nomeEmpresa' existe */}
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
                {/* 🆕 Usa 'quantidade' (que é igual em ambas as rotas) */}
                <p>Qnt: {alimento.quantidade}</p>
            </div>

        </div>
    );
}

export default AlimentoCard;