
import React, { useState } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/icons/mesaLogo.png";
import "./navbarRegister.css"


function navbarRegister() {
    return (
        <>  
            <nav className="container-topo">
                <div className="logo">
                    <Link to="/" aria-label="Ir para Sobre Nós">
                        <img className="logo_img" src={logo} alt="Mesa+ logotipo" />
                    </Link>
                </div>

                <div className="botao">
                    <Link className="btn-entrarRse" to="/login">Entrar</Link>
                </div>
            </nav>

        </>
    );
};

export default navbarRegister;