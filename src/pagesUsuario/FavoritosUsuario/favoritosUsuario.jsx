import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarUsuario from '../../components/navbarUsuario/navbarUsuario';
import EmpresaCard from '../../components/empresaCard/empresaCard'; 
// 1. Importe o componente de paginação
import Paginacao from '../../components/paginacaoCard/Paginacao'; 

import './favoritosUsuario.css'; 

// 2. Defina quantos itens você quer por página
const ITEMS_PER_PAGE = 4; 

function FavoritosUsuarioPage() {

    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. Estado para controlar a página atual
    const [currentPage, setCurrentPage] = useState(1);

    // Busca os favoritos ao carregar a página
    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                const userString = localStorage.getItem("user");
                const userType = localStorage.getItem("userType");

                if (!userString || userType !== 'pessoa') {
                    throw new Error("Usuário não autenticado.");
                }

                const usuario = JSON.parse(userString);

                const response = await axios.get(`http://localhost:8080/v1/mesa-plus/favorito?id_usuario=${usuario.id}`);

                if (response.data && response.data.status_code === 200) {
                    setFavoritos(response.data.result);
                } else {
                    setFavoritos([]); 
                }

            } catch (err) {
                console.error("Erro ao buscar favoritos:", err);
                if (err.response && err.response.status === 404) {
                    setFavoritos([]);
                } else {
                    setError(err.message || "Erro ao carregar favoritos.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavoritos();
    }, []);

    // 4. Lógica de Paginação (Cálculos)
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentFavoritos = favoritos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(favoritos.length / ITEMS_PER_PAGE);

    // Função para mudar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Função para remover um favorito
    const handleDeleteFavorito = async (idFavorito) => {
        if (!window.confirm("Deseja remover esta empresa dos favoritos?")) return;

        try {
            const response = await axios.delete(`http://localhost:8080/v1/mesa-plus/favorito/${idFavorito}`);

            if (response.status === 200) {
                alert("Favorito removido com sucesso!");
                
                // Atualiza a lista visualmente
                const novosFavoritos = favoritos.filter(item => item.id_favorito !== idFavorito);
                setFavoritos(novosFavoritos);

                // 5. Lógica defensiva: Se deletar o último item da página, volta uma página
                const novoTotalPages = Math.ceil(novosFavoritos.length / ITEMS_PER_PAGE);
                if (currentPage > novoTotalPages && novoTotalPages > 0) {
                    setCurrentPage(novoTotalPages);
                }
            }
        } catch (err) {
            console.error("Erro ao deletar favorito:", err);
            alert("Erro ao remover favorito.");
        }
    };

    // Renderização Condicional
    const renderContent = () => {
        if (loading) {
            return <div className="feedback-msg">Carregando seus favoritos...</div>;
        }
        
        if (error) {
            return <div className="feedback-msg error">{error}</div>;
        }

        if (favoritos.length === 0) {
            return (
                <div className="feedback-msg">
                    <p>Você ainda não tem nenhuma empresa favorita.</p>
                    <p style={{fontSize: '0.9rem', marginTop: '10px'}}>Visite a página inicial para encontrar doadores!</p>
                </div>
            );
        }

        return (
            <>
                {/* Grid mapeia apenas os 'currentFavoritos' (fatiados) */}
                <div className="favoritos-grid">
                    {currentFavoritos.map((item) => (
                        <EmpresaCard 
                            key={item.id_favorito} 
                            empresa={item} 
                            onCardClick={() => {}} 
                            onDeleteClick={() => handleDeleteFavorito(item.id_favorito)} 
                        />
                    ))}
                </div>

                {/* ADICIONE A CLASSE AQUI: className="paginacao-wrapper" */}
                <div className="paginacao-wrapper">
                    <Paginacao 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </>
        );
    };

    return (
        <>
            <NavbarUsuario/>
            <div className="page-container">
                <main className="conteudo-principal">
                    <h1 className="titulo-pagina">Minhas Empresas Favoritas</h1>
                    {renderContent()}
                </main>
            </div>
        </>
    );
}

export default FavoritosUsuarioPage;