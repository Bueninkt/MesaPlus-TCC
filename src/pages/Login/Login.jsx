import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ⬅️ useNavigate adicionado
import "./login.css";

import logo from "../../assets/icons/mesaLogo.png";
import emailIcon from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import seta from "../../assets/icons/seta.png";
import backimage from "../../assets/icons/backimage.png";

function LoginPage() {
  const [form, setForm] = useState({ email: "", senha: "", tipo: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });
  const navigate = useNavigate(); // ⬅️ instância do navigate

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function onSubmit(e) {
    e.preventDefault();

    // usa SOMENTE validação nativa (HTML5)
    const formEl = e.currentTarget; // <form>
    if (!formEl.checkValidity()) {
      formEl.reportValidity(); // mostra os balões padrões
      return;
    }

    setStatus({ type: "", msg: "", loading: true });

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/v1/mesa-plus";
    const url = `${API_BASE}/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: String(form.email).trim(),
          senha: String(form.senha),
          tipo: String(form.tipo)
        })
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha no login.");
      }

      const data = await res.json();
      if (data.status && data.usuario) {
        localStorage.setItem("userType", form.tipo);
        localStorage.setItem("user", JSON.stringify(data.usuario));
        setStatus({
          type: "success",
          msg: "Login Realizado",
          loading: false
        });

        // ⬇️ redireciona para /home após 2s
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 2470);

      } else {
        setStatus({ type: "error", msg: data.message || "Falha no login.", loading: false });
      }
    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Erro ao conectar.", loading: false });
    }
  }

  return (
    <>
      <header className="lg__header">
        <div className="container lg__headerGrid">
          <Link to="/" className="lg__homeLink" aria-label="Ir para Sobre Nós">
            <img className="lg__brandmark" src={logo} alt="Mesa+ logotipo" />
          </Link>
        </div>
      </header>

      <div className="lg__bg" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true" />

      <main className="lg" aria-labelledby="lg-title">
        <section className="lg__panel" role="region" aria-label="Entrar">
          <h1 id="lg-title" className="lg__brand">Mesa+</h1>
          <p className="lg__subtitle">Login</p>

          <form className="lg__form" onSubmit={onSubmit}>
            <label className="fieldLogin">
              <img className="field__icon" src={emailIcon} alt="" aria-hidden="true" />
              <span className="field__label">Email:</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                aria-label="Email"
                autoComplete="email"
                inputMode="email"
                required
              />
            </label>

            {/* Senha: required + minLength -> mensagem nativa */}
            <label className="fieldLogin field--pwd">
              <img className="field__icon" src={lockIcon} alt="" aria-hidden="true" />
              <span className="field__label">Senha:</span>
              <input
                type={showPwd ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={onChange}
                aria-label="Senha"
                autoComplete="current-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                title={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                <img src={showPwd ? eye : eyeclosed} alt="" aria-hidden="true" />
              </button>
            </label>

            <Link to="/recuperarSenhaParteEmail" className="lg__forgot">Esqueci minha senha :(</Link>

            {/* Tipo de login: required nativo */}
            <div className="selectField">
              <select
                name="tipo"
                value={form.tipo}
                onChange={onChange}
                aria-label="Escolha o tipo de login"
                required
                className="selectField__select"
                style={{ backgroundImage: `url(${seta})` }}
              >
                <option value="" disabled>Escolha o Login</option>
                <option value="pessoa">Pessoa</option>
                <option value="empresa">Empresa</option>
                <option value="ong">ONG</option>
              </select>
            </div>

            <Link to="/hudCadastros" className="lg__signup">Cadastre-se</Link>

            <button className="btnLogin btn--submit" type="submit" disabled={status.loading}>
              {status.loading ? "Entrando..." : "Entrar"}
            </button>

            <div className={`lg__status ${status.type ? `lg__status--${status.type}` : ""}`} aria-live="polite">
              {status.msg}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default LoginPage;
