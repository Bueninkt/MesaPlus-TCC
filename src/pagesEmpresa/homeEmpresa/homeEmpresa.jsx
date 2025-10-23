import React, { useState } from 'react';

// Importação dos componentes
import navbarEmpresa from "../../components/navbarEmpresa/navbarEmpresa";   
import filtros from "../../components/filtros/filtrar";

// Importação do NOVO CSS da página
import './HomeEmpresa.css'; 

// Renomeando para convenção do React (como no seu código original)
const NavbarEmpresa = navbarEmpresa;
const Filtrar = filtros;

// --- Mockup de dados para simular o grid da direita ---

// --------------------------------------------------------


function HomeEmpresaPage(params) {
    // Estado para armazenar os filtros atuais (opcional, mas bom para debug)
    const [filtrosAtuais, setFiltrosAtuais] = useState({});

   

    return (
        <>
            <NavbarEmpresa/>
            
            {/* O container principal que divide a página em duas colunas */}
            <main className="home-empresa-container">

                {/* Coluna da Esquerda: Filtros */}
                <aside className="coluna-filtros">
                    {/* Passamos a função de callback para o componente de filtro */}
                    <Filtrar/>
                </aside>
            </main>


        
               
        </>
    );

    
}

export default HomeEmpresaPage;