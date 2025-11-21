import React from 'react';
import './empresaCard.css';
import trash from '../../assets/icons/trash.png';
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

function EmpresaCard({ empresa, onCardClick, onDeleteClick }) {

    // Função auxiliar para mascarar o telefone (mesma lógica do modal)
    const maskPhone = (v) => {
        if (!v) return "---";
        let n = v.replace(/\D/g, "").slice(0, 11);
        if (n.length > 10) return n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        if (n.length > 6) return n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        return n;
    };

    // Tratamento de dados:
    // O backend pode mandar 'nome' (rota get empresa) ou 'nome_empresa' (rota get favoritos)
    const nomeExibicao = empresa.nome || empresa.nome_empresa || "Empresa sem nome";
    
    // O backend pode mandar 'foto' ou 'foto_empresa'
    const fotoExibicao = empresa.foto || empresa.foto_empresa || userDefaultEmpresa;
    
    const emailExibicao = empresa.email || "Email não informado";
    const telefoneExibicao = maskPhone(empresa.telefone);

    const handleDelete = (e) => {
        e.stopPropagation(); // Impede que o clique no lixo abra o modal da empresa
        if (onDeleteClick) {
            // Passa o ID do favorio ou da empresa, dependendo de como sua lista é montada
            onDeleteClick(empresa.id_favorito || empresa.id); 
        }
    };

    return (
        <div className="card-empresa-container" onClick={() => onCardClick(empresa)}>
            
            {/* 1. Imagem (Logo) */}
            <div className="empresa-imagem-container">
                <img 
                    src={fotoExibicao} 
                    alt={`Logo de ${nomeExibicao}`} 
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = userDefaultEmpresa; 
                    }}
                />
            </div>

            {/* 2. Informações (Centro) */}
            <div className="empresa-info-container">
                <h3>{nomeExibicao}</h3>
                
                <div className="detalhes-contato">
                    <p className="contato-item">
                        <strong>Email:</strong> {emailExibicao}
                    </p>
                    <p className="contato-item">
                        <strong>Telefone:</strong> {telefoneExibicao}
                    </p>
                </div>
            </div>

            {/* 3. Botão de Excluir (Direita/Baixo) */}
            {onDeleteClick && (
                <button className="card-delete-button" onClick={handleDelete} title="Remover dos favoritos">
                    <img src={trash} alt="Remover Favorito" />
                </button>
            )}

        </div>
    );
}

export default EmpresaCard;