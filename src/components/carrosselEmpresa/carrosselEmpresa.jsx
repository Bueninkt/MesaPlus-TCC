import React, { useState, useEffect, useRef } from 'react';
import setaLeft from "../../assets/icons/setaLeft.png";
import setaRight from "../../assets/icons/setaRight.png";

// Importa a estilização
import './carrosselEmpresa.css';

// --- (NOVO) Constantes de Layout (Baseado no seu CSS) ---
const ITEMS_PER_PAGE = 8; // O número de itens por "página" que você pediu
const ITEM_WIDTH = 100; // .empresa-item { width: 100px; }
const ITEM_GAP = 65; // .empresas-container { gap: 65px; }

// Largura total de um "bloco" (item + espaço)
const ITEM_BLOCK_WIDTH = ITEM_WIDTH + ITEM_GAP;
// Distância total para rolar por "página"
const SCROLL_PAGE_WIDTH = ITEMS_PER_PAGE * ITEM_BLOCK_WIDTH;


// --- Componente Principal do Carrossel ---
function CarrosselEmpresa() {
    
    // Estados da API
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NOVO: Estado para controlar a página atual do carrossel
    const [currentPage, setCurrentPage] = useState(0);

    // Referência para o container de scroll
    const scrollRef = useRef(null);

    // Lógica para buscar dados (Empresas) - Sem alteração
    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await fetch('http://localhost:8080/v1/mesa-plus/empresa');
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
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

    // NOVO: Calcular o total de "páginas"
    const totalPages = Math.ceil(empresas.length / ITEMS_PER_PAGE);

    // --- Funções de Scroll (LÓGICA ALTERADA) ---

    const scrollLeft = () => {
        if (scrollRef.current) {
            // Calcula a nova página (não pode ser menor que 0)
            const newPage = Math.max(0, currentPage - 1);
            
            // Calcula a nova posição de scroll absoluta
            const newScrollLeft = newPage * SCROLL_PAGE_WIDTH;

            // Usa scrollTo (posição absoluta)
            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            setCurrentPage(newPage);
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            // Calcula a nova página (não pode ser maior que a última página)
            const newPage = Math.min(currentPage + 1, totalPages - 1);
            
            // Calcula a nova posição de scroll absoluta
            const newScrollLeft = newPage * SCROLL_PAGE_WIDTH;

            // Usa scrollTo (posição absoluta)
            scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            setCurrentPage(newPage);
        }
    };

    // --- Renderização de Feedback (Sem alteração) ---
    if (loading) {
        return <div className="carrossel-feedback">Carregando empresas...</div>;
    }

    if (error) {
        return <div className="carrossel-feedback">Erro ao carregar empresas: {error}</div>;
    }

    if (empresas.length === 0) {
        return <div className="carrossel-feedback">Nenhuma empresa cadastrada no momento.</div>;
    }

    // --- Renderização Principal (JSX sem alteração) ---
    return (
        <div className="carrossel-empresa-wrapper">
            
            {/* Seta Esquerda */}
            <button className="carrossel-arrow arrow-left" onClick={scrollLeft}>
                <img src={setaLeft} alt="Scroll Esquerda" />
            </button>

            {/* Container das Empresas (com scroll) */}
            <div className="empresas-container" ref={scrollRef}>
                {empresas.map(empresa => (
                    <div className="empresa-item" key={empresa.id}>
                        <img 
                            src={empresa.foto_perfil} // Assumindo 'foto_perfil' como o campo da imagem
                            alt={`Logo ${empresa.nome}`} 
                            className="empresa-logo"
                        />
                        <p className="empresa-nome">{empresa.nome}</p>
                    </div>
                ))}
            </div>

            {/* Seta Direita */}
            <button className="carrossel-arrow arrow-right" onClick={scrollRight}>
                <img src={setaRight} alt="Scroll Direita" />
            </button>
            
        </div>
    );
}

export default CarrosselEmpresa;