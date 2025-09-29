import React from 'react';
import { Link } from 'react-router-dom';
import './hudcadastros.css';

import logo from "../../assets/icons/mesaLogo.png";
import bag from "../../assets/icons/bag.png";
import houseEat from "../../assets/icons/houseEat.png";
import user from "../../assets/icons/user.png";

function HudCadastrosPage() {
  return (
    <>
      {/* Topo */}
      <header className="hud__header" aria-label="Cabeçalho">
        <div className="container hud__headerGrid">
          <Link to="/" className="hud__homeLink" aria-label="Ir para Sobre Nós">
            <img className="hud__brandmark" src={logo} alt="Mesa+ logotipo" />
          </Link>

          <h1 className="hud__title">Hud de Cadastro</h1>
          <Link to="/login" className="btn btn--login">Entrar</Link>
        </div>
      </header>


      {/* Cartões */}
      <main className="hud" aria-labelledby="hud-title">
        <h2 id="hud-title" className="sr-only">Opções de cadastro</h2>
        <div className="container">
          <ul className="hud__cards" role="list">
            {/* Pessoa */}
            <li className="card">
              <h3 className="card__brand">Mesa+</h3>
              <p className="card__subtitle">Cadastrar Pessoa</p>
              <img className="card__icon" src={user} alt="" aria-hidden="true" />
              <Link to="/cadastroPessoa" className="btn btn--go">Ir para</Link>
            </li>

            {/* Empresa */}
            <li className="card">
              <h3 className="card__brand">Mesa+</h3>
              <p className="card__subtitle">Cadastrar Empresa</p>
              <img className="card__icon" src={houseEat} alt="" aria-hidden="true" />
              <Link to="/cadastroEmpresa" className="btn btn--go">Ir para</Link>
            </li>

            {/* ONGs */}
            <li className="card">
              <h3 className="card__brand">Mesa+</h3>
              <p className="card__subtitle">Cadastrar ONGs</p>
              <img className="card__icon" src={bag} alt="" aria-hidden="true" />
              <Link to="/cadastroOng" className="btn btn--go">Ir para</Link>
            </li>
          </ul>
        </div>
      </main>
    </>
  );
}

export default HudCadastrosPage;
