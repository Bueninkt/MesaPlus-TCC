import React, { useState, useEffect, useRef } from 'react';
import setaLeft from "../../assets/icons/setaLeft.png";
import setaRight from "../../assets/icons/setaRight.png";
import userDefaultEmpresa from '../../assets/icons/userDefaultEmpresa.png';

// 1. Importe o Modal que acabamos de criar
import ModalCarrosselEmpresa from '../../components/modalCarrosselEmpresa/modalCarrosselEmpresa'; 

import './carrosselEmpresa.css';

const ITEMS_PER_PAGE = 8; 
const ITEM_WIDTH = 100; 
const ITEM_GAP = 65; 
const ITEM_BLOCK_WIDTH = ITEM_WIDTH + ITEM_GAP;
const SCROLL_PAGE_WIDTH = ITEMS_PER_PAGE * ITEM_BLOCK_WIDTH;

function CarrosselEmpresa() {
    
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    
    // --- NOVOS ESTADOS PARA O MODAL ---
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ----------------------------------

    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await fetch('http://localhost:8080/v1/mesa-plus/empresa');
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                
                const data = await response.json();
                
                if (data.status === true && Array.isArray(data.empresas)) {
                    setEmpresas(data.empresas);
                } else {
                    setEmpresas([]);
                }
            } catch (e) {
                setError(e.message);
                console.error("Falha ao buscar dados da API de empresas:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchEmpresas();
    }, []);

    const totalPages = Math.ceil(empresas.length / ITEMS_PER_PAGE);

    const scrollLeft = () => {
        if (scrollRef.current) {
            const newPage = Math.max(0, currentPage - 1);
            const newScrollLeft = newPage * SCROLL_PAGE_WIDTH;
            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            setCurrentPage(newPage);
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            const newPage = Math.min(currentPage + 1, totalPages - 1);
            const newScrollLeft = newPage * SCROLL_PAGE_WIDTH;
            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            setCurrentPage(newPage);
        }
    };

    // --- NOVAS FUNÇÕES DE HANDLER ---
    const handleCardClick = (id) => {
        setSelectedEmpresaId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmpresaId(null);
    };
    // --------------------------------

    if (loading) return <div className="carrossel-feedback">Carregando empresas...</div>;
    if (error) return <div className="carrossel-feedback">Erro ao carregar empresas: {error}</div>;
    if (empresas.length === 0) return <div className="carrossel-feedback">Nenhuma empresa cadastrada.</div>;

    return (
        <div className="carrossel-empresa-wrapper">
            
            <button className="carrossel-arrow arrow-left" onClick={scrollLeft}>
                <img src={setaLeft} alt="Scroll Esquerda" />
            </button>

            <div className="empresas-container" ref={scrollRef}>
                {empresas.map(empresa => (
                    // Adicionamos o onClick no item da empresa
                    <div 
                        className="empresa-item" 
                        key={empresa.id}
                        onClick={() => handleCardClick(empresa.id)} // Ao clicar, abre o modal
                        style={{ cursor: 'pointer' }} // Adiciona cursor pointer para indicar clique
                    >
                        <img 
                            src={empresa.foto || userDefaultEmpresa} 
                            alt={`Logo ${empresa.nome}`} 
                            className="empresa-logo"
                            onError={(e) => { e.target.src = userDefaultEmpresa; }}
                        />
                        <p className="empresa-nome">{empresa.nome}</p>
                    </div>
                ))}
            </div>

            <button className="carrossel-arrow arrow-right" onClick={scrollRight}>
                <img src={setaRight} alt="Scroll Direita" />
            </button>

            {/* 2. Renderizamos o Modal aqui.
                Ele é "invisível" até isOpen ser true 
            */}
            <ModalCarrosselEmpresa 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                empresaId={selectedEmpresaId} 
            />
            
        </div>
    );
}

export default CarrosselEmpresa;