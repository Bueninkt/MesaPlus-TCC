import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 
import './modalCarrosselEmpresa.css'; 
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png'; 
import AlimentoCard from '../alimentoCard/alimentoCard'; 
import Paginacao from '../../components/paginacaoCard/Paginacao'; 

import favorito from '../../assets/icons/favorito.png';

const maskPhone = (v) => {
    if (!v) return "";
    let n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length > 10) return n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (n.length > 6) return n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return n;
};

const maskCNPJ = (v) => {
    if (!v) return "";
    return v.replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
};

const ITEMS_PER_PAGE = 2;

function ModalCarrosselEmpresa({ isOpen, onClose, empresaId }) {
    
    const navigate = useNavigate(); 
    
    const [empresa, setEmpresa] = useState(null);
    const [alimentos, setAlimentos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (isOpen && empresaId) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                setAlimentos([]); 
                setCurrentPage(1); 
                setIsFavorited(false); 

                try {
                    const resEmpresa = await fetch(`http://localhost:8080/v1/mesa-plus/empresa/${empresaId}`);
                    if (!resEmpresa.ok) throw new Error("Erro ao carregar empresa.");
                    const dataEmpresa = await resEmpresa.json();

                    if (dataEmpresa.status && dataEmpresa.empresa) {
                        setEmpresa(dataEmpresa.empresa);
                    } else {
                        throw new Error("Empresa não encontrada.");
                    }

                    const resAlimentos = await fetch(`http://localhost:8080/v1/mesa-plus/empresaAlimento/${empresaId}`);
                    
                    if (resAlimentos.ok) {
                        const dataAlimentos = await resAlimentos.json();
                        if (dataAlimentos.status && Array.isArray(dataAlimentos.resultFiltro)) {
                            setAlimentos(dataAlimentos.resultFiltro);
                        }
                    }

                } catch (err) {
                    console.error(err);
                    setError(err.message || "Erro desconhecido.");
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        } else {
            setEmpresa(null);
            setAlimentos([]);
        }
    }, [isOpen, empresaId]);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentAlimentos = alimentos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(alimentos.length / ITEMS_PER_PAGE);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 🆕 Lógica Atualizada: Suporte para Pessoa e ONG
    const handleToggleFavorito = async () => {
        try {
            // 1. Recupera dados do LocalStorage
            const userString = localStorage.getItem("user");
            const userType = localStorage.getItem("userType"); 

            // 2. Verifica se está logado e se é um tipo válido (pessoa ou ong)
            if (!userString || (userType !== 'pessoa' && userType !== 'ong')) {
                alert("Você precisa estar logado como Usuário ou ONG para favoritar empresas.");
                return;
            }

            const usuario = JSON.parse(userString);

            // 3. Monta o payload dinamicamente
            let payload = {};

            if (userType === 'pessoa') {
                payload = {
                    id_usuario: usuario.id,
                    id_empresa: empresa.id
                };
            } else if (userType === 'ong') {
                payload = {
                    id_ong: usuario.id, // Aqui usamos o ID da ONG
                    id_empresa: empresa.id
                };
            }

            console.log("Payload enviado:", payload);

            // 4. Envia para o endpoint (a controller aceita os dois formatos)
            const response = await axios.post('http://localhost:8080/v1/mesa-plus/favoritoUser', payload);

            if (response.status === 200 || response.status === 201) {
                setIsFavorited(true);
                alert("Empresa adicionada aos favoritos com sucesso!");
                
                // 5. Redirecionamento condicional (opcional)
                // Se você tiver páginas diferentes de favoritos para ONG e Pessoa:
                if (userType === 'pessoa') {
                    navigate('/favoritosUsuario'); 
                } else {
                    // Supondo que você tenha/vai criar essa rota para ONGs
                    navigate('/favoritosOng'); 
                    // Ou use a mesma rota se a página for genérica
                }
            }

        } catch (error) {
            console.error("Erro ao favoritar:", error);
            alert("Erro ao adicionar aos favoritos. Tente novamente.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-empresa" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="btn-close-modal" onClick={onClose}>&times;</button>

                {loading ? (
                    <div className="modal-loading">Carregando informações...</div>
                ) : error ? (
                    <div className="modal-error">{error}</div>
                ) : empresa ? (
                    <>
                        <div className="modal-header-empresa">
                            <img 
                                src={empresa.foto || userDefaultEmpresa} 
                                alt={empresa.nome} 
                                className="modal-empresa-foto"
                                onError={(e) => { e.target.src = userDefaultEmpresa; }}
                            />
                            <h2 className="modal-empresa-nome">{empresa.nome}</h2>
                        </div>

                        <div className="modal-scroll-area">
                            
                            <div className="modal-section">
                                <div className="modal-section-header-wrapper">
                                    <h3 className="modal-section-title">DADOS DE CONTATO</h3>
                                    
                                    <button 
                                        className={`btn-favorito ${isFavorited ? 'active' : ''}`} 
                                        onClick={handleToggleFavorito}
                                        title="Favoritar Empresa"
                                    >
                                        <img src={favorito} alt="Coração Favorito" />
                                    </button>
                                </div>

                                <div className="modal-info-grid">
                                    <div className="modal-info-row">
                                        <span className="modal-label">Email</span>
                                        <span className="modal-value">{empresa.email}</span>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Telefone</span>
                                        <span className="modal-value">{maskPhone(empresa.telefone)}</span>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">CNPJ/MEI</span>
                                        <span className="modal-value">{maskCNPJ(empresa.cnpj_mei)}</span>
                                    </div>
                                    <div className="modal-info-row">
                                        <span className="modal-label">Endereço</span>
                                        <span className="modal-value">
                                            {empresa.endereco ? empresa.endereco : "Não informado"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section">
                                <h3 className="modal-section-title">
                                    Doações Disponíveis: 
                                </h3>
                                
                                {alimentos.length > 0 ? (
                                    <>
                                        <div className="modal-alimentos-list">
                                            {currentAlimentos.map(item => (
                                                <AlimentoCard 
                                                    key={item.id_alimento} 
                                                    alimento={item} 
                                                    onCardClick={() => {}} 
                                                    onDeleteClick={null} 
                                                />
                                            ))}
                                        </div>
                                        <Paginacao 
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                        />
                                    </>
                                ) : (
                                    <p className="modal-empty-msg">Esta empresa não possui alimentos cadastrados no momento.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default ModalCarrosselEmpresa;