import React, { useState, useEffect } from 'react';
import './modalCarrosselEmpresa.css'; 
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png'; 
// 1. Importe o AlimentoCard
import AlimentoCard from '../alimentoCard/alimentoCard'; 
// 2. Importe o componente de Paginação (Ajuste o caminho se sua pasta for diferente)
import Paginacao from '../../components/paginacaoCard/Paginacao'; 

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

// Defina quantos itens você quer por página (3 conforme a altura do seu modal)
const ITEMS_PER_PAGE = 2;

function ModalCarrosselEmpresa({ isOpen, onClose, empresaId }) {
    const [empresa, setEmpresa] = useState(null);
    const [alimentos, setAlimentos] = useState([]);
    
    // Estado para paginação
    const [currentPage, setCurrentPage] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && empresaId) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                setAlimentos([]); 
                setCurrentPage(1); // Resetar para página 1 sempre que abrir ou trocar empresa
                
                try {
                    // --- FETCH 1: Dados da Empresa ---
                    const resEmpresa = await fetch(`http://localhost:8080/v1/mesa-plus/empresa/${empresaId}`);
                    if (!resEmpresa.ok) throw new Error("Erro ao carregar empresa.");
                    const dataEmpresa = await resEmpresa.json();

                    if (dataEmpresa.status && dataEmpresa.empresa) {
                        setEmpresa(dataEmpresa.empresa);
                    } else {
                        throw new Error("Empresa não encontrada.");
                    }

                    // --- FETCH 2: Alimentos da Empresa ---
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

    // --- LÓGICA DE PAGINAÇÃO (Client Side) ---
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentAlimentos = alimentos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(alimentos.length / ITEMS_PER_PAGE);

    // Função para mudar página (será passada para o componente Paginacao)
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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
                        {/* Cabeçalho Fixo */}
                        <div className="modal-header-empresa">
                            <img 
                                src={empresa.foto || userDefaultEmpresa} 
                                alt={empresa.nome} 
                                className="modal-empresa-foto"
                                onError={(e) => { e.target.src = userDefaultEmpresa; }}
                            />
                            <h2 className="modal-empresa-nome">{empresa.nome}</h2>
                        </div>

                        {/* Corpo com Rolagem */}
                        <div className="modal-scroll-area">
                            
                            {/* Dados Cadastrais */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">Dados de Contato</h3>
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

                            {/* Lista de Alimentos Paginada */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">
                                    Doações Disponíveis: 
                                </h3>
                                
                                {alimentos.length > 0 ? (
                                    <>
                                        <div className="modal-alimentos-list">
                                            {/* Mapeamos currentAlimentos em vez de todos */}
                                            {currentAlimentos.map(item => (
                                                <AlimentoCard 
                                                    key={item.id_alimento} 
                                                    alimento={item} 
                                                    onCardClick={() => {}} 
                                                    onDeleteClick={null} 
                                                />
                                            ))}
                                        </div>

                                        {/* Componente de Paginação */}
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