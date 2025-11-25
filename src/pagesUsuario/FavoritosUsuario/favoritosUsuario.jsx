import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarUsuario from '../../components/navbarUsuario/navbarUsuario';
import EmpresaCard from '../../components/empresaCard/empresaCard'; 
import Paginacao from '../../components/paginacaoCard/Paginacao'; 

// 1. Importe o Modal de Empresa
import ModalCarrosselEmpresa from '../../components/modalCarrosselEmpresa/modalCarrosselEmpresa';

import './favoritosUsuario.css'; 

const ITEMS_PER_PAGE = 6; 

function FavoritosUsuarioPage() {

    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // 2. Novos Estados para controlar o Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);

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

    // Cálculos de Paginação
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentFavoritos = favoritos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(favoritos.length / ITEMS_PER_PAGE);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 3. Função para ABRIR o Modal
    const handleCardClick = (empresa) => {
        // O objeto 'empresa' vindo do favorito tem o campo 'id_empresa'
        // Mas o objeto vindo de busca normal tem 'id'.
        // Usamos uma lógica "ou" para garantir.
        const idParaModal = empresa.id_empresa || empresa.id;
        
        setSelectedEmpresaId(idParaModal);
        setModalOpen(true);
    };

    // 4. Função para FECHAR o Modal
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEmpresaId(null);
    };

    const handleDeleteFavorito = async (idFavorito) => {
        if (!window.confirm("Deseja remover esta empresa dos favoritos?")) return;

        try {
            const response = await axios.delete(`https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/favorito/${idFavorito}`);

            if (response.status === 200) {
                alert("Favorito removido com sucesso!");
                
                const novosFavoritos = favoritos.filter(item => item.id_favorito !== idFavorito);
                setFavoritos(novosFavoritos);

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

    const renderContent = () => {
        if (loading) return <div className="feedback-msg">Carregando seus favoritos...</div>;
        if (error) return <div className="feedback-msg error">{error}</div>;

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
                <div className="favoritos-grid">
                    {currentFavoritos.map((item) => (
                        <EmpresaCard 
                            key={item.id_favorito} 
                            empresa={item} 
                            // 5. Passamos a função que abre o modal aqui
                            onCardClick={handleCardClick} 
                            onDeleteClick={() => handleDeleteFavorito(item.id_favorito)} 
                        />
                    ))}
                </div>

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

            {/* 6. Renderização do Modal */}
                {/* Ele fica "escondido" até modalOpen ser true */}
                <ModalCarrosselEmpresa 
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    empresaId={selectedEmpresaId}
                    ocultarFavorito={true}
                />
        </>
    );
}

export default FavoritosUsuarioPage;