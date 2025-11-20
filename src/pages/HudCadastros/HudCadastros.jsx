import React from 'react';
import { Link } from 'react-router-dom';
import './hudcadastros.css';


import bag from "../../assets/icons/bag.png";
import houseEat from "../../assets/icons/houseEat.png";
import user from "../../assets/icons/user.png";
import backimage from "../../assets/icons/backimage.png";
import navbarHud from "../../components/navbar/navbarHud";

const NavbarHud = navbarHud

function HudCadastrosPage() {
  return (
    <>

      <NavbarHud />



      <div className="hudcadastros-bg" style={{ backgroundImage: `url(${backimage})` }}></div>

      {/* Cartões */}
      <main className="hud" aria-labelledby="hud-title">
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
