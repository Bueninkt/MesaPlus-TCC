import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import backimage from "../../assets/icons/backimage.png";
import "./recuperarSenhaParteCodigo.css";
import navbarRegister from "../../components/navbar/navbarRegister";

const Navbar = navbarRegister;

// Função de validação simples para o campo de código
const validateCode = (code) => {
  if (!code) return "O campo de código é obrigatório.";
  return "";
};

function RecuperarSenhaParteCodigo() {
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState("");

  // NOVO: Estado unificado para loading, erro e SUCESSO.
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: ""
  });

  const handleCodigoChange = (e) => {
    setCodigo(e.target.value);
    // Limpa as mensagens ao digitar um novo código
    setStatus({ loading: false, error: "", success: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação antes do envio
    const validationError = validateCode(codigo);
    if (validationError) {
      setStatus({ loading: false, error: validationError, success: "" });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });

    const email = localStorage.getItem("email");
    const tipo = localStorage.getItem("userType");

    if (!email || !tipo) {
      setStatus({
        loading: false,
        error: "Sessão expirada. Por favor, volte e peça um novo código.",
        success: "",
      });
      return;
    }

    try {
      // 1. VERIFICAR O CÓDIGO
      await axios.post('http://localhost:8080/v1/mesa-plus/codigo-recuperacao', { email, tipo, codigo });

      // 2. APAGAR O CÓDIGO DO BANCO
      await axios.put('http://localhost:8080/v1/mesa-plus/apagar-codigo', { email, tipo });

      // 3. NOVO: DEFINIR MENSAGEM DE SUCESSO
      setStatus({
        loading: false,
        error: "",
        success: "Código verificado com sucesso! Redirecionando...",
      });

      // 4. NOVO: REDIRECIONAR APÓS UM BREVE INTERVALO
      setTimeout(() => {
        navigate("/recuperarNovaSenha");
      }, 2500); // Aguarda 2.5 segundos para o usuário ler a mensagem

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Código inválido ou expirado. Tente novamente.";
      setStatus({ loading: false, error: errorMessage, success: "" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="imagemFundoRsc" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true" />

      <main className="container-RecuperarSenhaParteCodigo">
        <div className="menu-top">
          <p className="mesa">Mesa+</p>
          <p className="recuperar">Recuperação Senha</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            <input
              type="text"
              name="codigo"
              aria-label="Codigo"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Insira o código enviado"
              required
              maxLength={6}
              value={codigo}
              onChange={handleCodigoChange}
              // Desabilita o campo se estiver carregando OU se já deu sucesso
              disabled={status.loading || status.success}
              aria-invalid={!!status.error}
            />
          </label>

          <div className="menu-info">
            <h2 className="infoCodigo">Verifique o código no seu email</h2>
            <Link className="reenvio" to="/recuperarSenhaParteEmail">
              Reenviar Código
            </Link>
          </div>

          {/* NOVO: Renderização condicional para as mensagens */}
          {status.error && <p className="error-message" role="alert">{status.error}</p>}
          {status.success && <p className="success-message" role="alert">{status.success}</p>}

          <button
            className="btnRecuperarPC btn--submitRecuperarPC"
            type="submit"

            disabled={status.loading || status.success}
          >
            {status.loading ? "Verificando..." : "Verificar Código"}
          </button>
        </form>
      </main>
    </>
  );
}

export default RecuperarSenhaParteCodigo;