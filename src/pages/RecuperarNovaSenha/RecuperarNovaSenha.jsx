import React, { useState } from "react";
import backimage from "../../assets/icons/backimage.png";
import check from '../../assets/icons/check.png'
import lockIcon from "../../assets/icons/lock.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";

import "./recuperarNovaSenha.css";

import navbarRegister from "../../components/navbar/navbarRegister";
const Navbar = navbarRegister;

function RecuperarNovaSenha() {
  // Controles de visibilidade independentes para os ícones de olho
  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);

  return (
    <>
      <Navbar />

      <div
        className="imagemFundoRss"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />

      <main className="container-RecuperarNovaSenha">
        <div className="menuNs-top">
          <p className="mesaNs">Mesa+</p>
          <p className="recuperarNs">Recuperação Senha</p>
        </div>

        <form>
          {/* NOVA SENHA */}
          <label>
            <img className="imagemCadeado" src={lockIcon} alt="cadeado" aria-hidden="true" />

            <input
              type={showNova ? "text" : "password"}
              name="novaSenha"
              aria-label="Nova Senha"
              autoComplete="new-password"
              placeholder="Nova Senha:"
              required
              minLength={10}
            />

            <button
              type="button"
              className="olhoDois"
              onClick={() => setShowNova((s) => !s)}
              aria-label={showNova ? "Ocultar senha" : "Mostrar senha"}
              title={showNova ? "Ocultar senha" : "Mostrar senha"}
            >
              <img src={showNova ? eye : eyeclosed} alt="" aria-hidden="true" />
            </button>
          </label>

          {/* CONFIRMAR SENHA */}
          <label>
            <img className="imagemCheck" src={check} alt="Check" aria-hidden="true" />

            <input
              type={showConf ? "text" : "password"}
              name="confirmarSenha"
              aria-label="Confirmar Senha"
              autoComplete="new-password"
              placeholder="Confirmar Senha:"
              required
              minLength={10}
            />

            <button
              type="button"
              className="olho"
              onClick={() => setShowConf((s) => !s)}
              aria-label={showConf ? "Ocultar senha" : "Mostrar senha"}
              title={showConf ? "Ocultar senha" : "Mostrar senha"}
            >
              <img src={showConf ? eye : eyeclosed} alt="" aria-hidden="true" />
            </button>
          </label>

          
          <button
            className="btnRecuperarNovaSenha btn--submitRecuperarNovaSenha"
            type="submit"
          >
            Recuperar Senha
          </button>
          
        </form>
      </main>
    </>
  );
}

export default RecuperarNovaSenha;