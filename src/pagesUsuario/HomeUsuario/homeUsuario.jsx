import React, { useState, useEffect } from 'react';

// Importação dos componentes
import navbarUsuario from "../../components/navbarUsuario/navbarUsuario";
import filtros from "../../components/filtros/filtrar";


// Importação do CSS da página
import './HomeUsuario.css'; 

// Renomeando para convenção do React
const NavbarUsuario = navbarUsuario;
const Filtrar = filtros;

function HomeUsuarioPage(params) {
  

 
    return (
        <>
            <NavbarUsuario/>
            
            {/* O container principal que divide a página em duas colunas */}
            <main className="home-usuario-container">

                {/* Coluna da Esquerda: Filtros */}
                <aside className="coluna-filtros">
                    {/* Passamos a função de callback para o componente de filtro */}
                    <Filtrar/>
                </aside>
            </main>

        </>
    );
}

export default HomeUsuarioPage;