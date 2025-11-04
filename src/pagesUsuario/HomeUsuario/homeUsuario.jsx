import React, { useState } from 'react';

// Importação dos componentes
import navbarUsuario from "../../components/navbarUsuario/navbarUsuario";   //Navbar de Usuario
import filtros from "../../components/filtros/filtrar";

// Importação do NOVO CSS da página
import './HomeUsuario.css'; 

// Renomeando para convenção do React (como no seu código original)
const NavbarUsuario = navbarUsuario;
const Filtrar = filtros;

// --- Mockup de dados para simular o grid da direita ---

// --------------------------------------------------------


function HomeUsuarioPage(params) {
    // Estado para armazenar os filtros atuais (opcional, mas bom para debug)
    const [filtrosAtuais, setFiltrosAtuais] = useState({});

   

    return (
        <>
            <NavbarUsuario/>
            
            {/* O container principal que divide a página em duas colunas */}
            <main className="home-usuario-container">

                {/* Coluna da Esquerda: Filtros */}
                <aside className="coluna-filtros-usuario">
                    {/* Passamos a função de callback para o componente de filtro */}
                    <Filtrar/>
                </aside>
            </main>


        
               
        </>
    );

    
}

export default HomeUsuarioPage;