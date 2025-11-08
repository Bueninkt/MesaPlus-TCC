import React, { useState, useEffect } from 'react';

// Importação dos componentes
import navbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import filtros from "../../components/filtros/filtrar";
import AlimentoCard from '../../components/alimentoCard/alimentoCard'; 
import CarrosselEmpresa from '../../components/carrosselEmpresa/carrosselEmpresa';
import PaginacaoCard from '../../components/paginacaoCard/paginacao'; // 1. IMPORTAR A PAGINAÇÃO

// Importação do CSS da página
import './HomeUsuario.css'; 

// Renomeando para convenção do React
const NavbarUsuario = navbarUsuario;
const Filtrar = filtros;

function HomeUsuarioPage(params) {
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- NOVOS ESTADOS PARA PAGINAÇÃO ---
    const [currentPage, setCurrentPage] = useState(1); // Página atual
    const itemsPerPage = 4; // Itens por página (baseado no seu layout)
    // ------------------------------------

    useEffect(() => {
        const fetchAlimentos = async () => {
            try {
                const response = await fetch('http://localhost:8080/v1/mesa-plus/alimentos');
                if (!response.ok) {
                    throw new Error('Falha ao buscar alimentos da API');
                }
                const data = await response.json();
                if (data && data.alimentos) {
                    setAlimentos(data.alimentos);
                }
            } catch (error) {
                console.error("Erro ao carregar alimentos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlimentos(); 
    }, []); 

    // --- LÓGICA DA PAGINAÇÃO ---
    // Calcula o índice do último item da página atual
    const indexOfLastItem = currentPage * itemsPerPage; 
    // Calcula o índice do primeiro item da página atual
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; 
    // "Fatia" o array de alimentos para pegar apenas os itens da página atual
    const currentAlimentos = alimentos.slice(indexOfFirstItem, indexOfLastItem);
    // Calcula o número total de páginas
    const totalPages = Math.ceil(alimentos.length / itemsPerPage);
    // -------------------------

    return (
        <>
            <NavbarUsuario />
            
            <main className="home-usuario-container">

                <aside className="coluna-filtros-usuario">
                    <Filtrar />
                </aside>

                <section className="coluna-alimentos-grid">
                    
                    <CarrosselEmpresa /> 

                    {loading ? (
                        <p>Carregando alimentos...</p> 
                    ) : (
                        // 2. Usamos um Fragment <> para agrupar o grid e a paginação
                        <> 
                            <div className="alimentos-grid-wrapper"> 
                                {/* 3. Mapeamos 'currentAlimentos' (só os 4) em vez de 'alimentos' (todos) */}
                                {currentAlimentos.map(alimento => (
                                    <AlimentoCard 
                                        key={alimento.id} 
                                        alimento={alimento} 
                                    />
                                ))}
                            </div>

                            {/* 4. ADICIONAR O COMPONENTE DE PAGINAÇÃO */}
                            <PaginacaoCard
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage} // Passa a função para mudar a página
                            />
                        </>
                    )}

                    {!loading && alimentos.length === 0 && (
                        <p>Nenhum alimento encontrado.</p>
                    )}
                </section>

            </main>
        </>
    );
}

export default HomeUsuarioPage;