import React from "react";

import { Link } from "react-router-dom";
import backimage from "../../assets/icons/backimage.png";
import "./recuperarSenhaParteCodigo.css";

import navbarRegister from "../../components/navbar/navbarRegister";

const Navbar = navbarRegister;

function RecuperarSenhaParteCodigo() {
 

  return (
    <>
      <Navbar />

      <div className="imagemFundoRsc" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true" />

      <main className="container-RecuperarSenhaParteCodigo">
        <div className="h1">
          Mesa+
        </div>
        
        <p className="recuperar">Recuperação Senha</p>

        {/* O manipulador onSubmit foi removido do formulário */}
        <form>
          <label>
            <input
              type="text"
              name="codigo"
              aria-label="Codigo"
              inputMode="numeric"
              placeholder="Insira o código: "
              required
            />
          </label>

          <h2>Codigo enviado pelo email</h2>
          
          <p className="reenvio">Reenviar Codigo</p>
          
          {/* O botão foi simplificado, pois não depende mais do estado 'status' */}
          <button className="btnRecuperarSenhaParteCodigo btn--submitRecuperarSenhaParteCodigo" type="submit">
            Verificar Codigo
          </button>
          
        </form>
        
      </main>
    </>
  );
}

export default RecuperarSenhaParteCodigo;