import React, { useState } from 'react';

// Importação dos componentes
import navbarOng from "../../components/navbarOng/navbarOng";   //Navbar de ong
import filtros from "../../components/filtros/filtrar";

// Importação do NOVO CSS da página
import './HomeOng.css'; 

// Renomeando para convenção do React (como no seu código original)
const NavbarOng = navbarOng;
const Filtrar = filtros;

// --- Mockup de dados para simular o grid da direita ---

// --------------------------------------------------------


function HomeOngPage(params) {
    // Estado para armazenar os filtros atuais (opcional, mas bom para debug)
    const [filtrosAtuais, setFiltrosAtuais] = useState({});

    return (
        <>
            <NavbarOng/>
            
            {/* O container principal que divide a página em duas colunas */}
            <main className="home-ong-container">

                {/* Coluna da Esquerda: Filtros */}
                <aside className="coluna-filtros">
                    {/* Passamos a função de callback para o componente de filtro */}
                    <Filtrar/>
                </aside>
            </main>


        
               
        </>
    );

    
}

export default HomeOngPage;