
import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/icons/mesaLogo.png";
import "./navbarHud.css"


function navbarHud() {
    return (
        <>  
            <nav className="container-topoHud">
                <div className="logoHud">
                    <Link to="/" aria-label="Ir para Sobre Nós">
                        <img className="logo_imgHud" src={logo} alt="Mesa+ logotipo" />
                    </Link>
                </div>

                <div className="texto-hud">
                     <h1>Hud de Cadastro</h1>                            
                </div>

                <div className="botaoHud">
                    <Link className="btn-entrarHud" to="/login">Entrar</Link>
                </div>
            </nav>

        </>
    );
};

export default navbarHud;