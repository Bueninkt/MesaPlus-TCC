import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./recuperarSenhaParteEmail.css";

import emailIcon from "../../assets/icons/email.png";
import seta from "../../assets/icons/seta.png";
import backimage from "../../assets/icons/backimage.png";

import navbarRegister from "../../components/navbar/navbarRegister";
const Navbar = navbarRegister;

function RecuperarSenhaParteEmail() {
  const [form, setForm] = useState({ email: "", tipo: "" });
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function onSubmit(e) {
    e.preventDefault();

    // validação nativa (HTML5)
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    setStatus({ type: "", msg: "", loading: true });

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/v1/mesa-plus";
    const url = `${API_BASE}/enviar-codigo`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          email: String(form.email).trim().toLowerCase(),
          tipo: String(form.tipo)
        })
      });

      // tenta ler como texto e depois parsear para JSON (respostas podem variar)
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text || "" }; }

      if (!res.ok) {
        throw new Error(data.message || "Falha ao enviar código.");
      }

      // Sucesso
      setStatus({
        type: "success",
        msg: data.message || "Código enviado! Verifique seu e-mail.",
        loading: false
      });

      // segue para a etapa de validar código, levando email/tipo
      navigate("/recuperarSenhaParteCodigo", {
        replace: true,
        state: { email: form.email.trim().toLowerCase(), tipo: form.tipo }
      });

    } catch (err) {
      setStatus({
        type: "error",
        msg: err.message || "Erro ao conectar.",
        loading: false
      });
    }
  }

  return (
    <>
      <Navbar />

      <div
        className="imagemFundo"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />

      <main className="container-Recuperar">
        <div className="h1">Mesa+</div>
        <p>Recuperação Senha</p>

        <form onSubmit={onSubmit}>
          <label>
            <img className="iconeEmail" src={emailIcon} alt="email" aria-hidden="true" />
            <span>Email:</span>
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

          <div className="tipo-container">
            <select
              name="tipo"
              value={form.tipo}
              onChange={onChange}
              aria-label="Escolha o tipo de cadastro"
              required
              className="tipo-cadastro"
              style={{ backgroundImage: `url(${seta})` }}
            >
              <option value="" disabled>Escolha o Tipo</option>
              <option value="pessoa">Pessoa</option>
              <option value="empresa">Empresa</option>
              <option value="ong">ONG</option>
            </select>
          </div>

          <h2>Código enviado pelo e-mail</h2>

          <button
            className="btnRecuperar btn--submitRecuperar"
            type="submit"
            disabled={status.loading}
          >
            {status.loading ? "Enviando..." : "Enviar"}
          </button>

          {/* Exibição de status sem alterar sua lógica geral */}
          {status.msg && (
            <div
              className={`statusRecuperar ${status.type ? `statusRecuperar--${status.type}` : ""}`}
              aria-live="polite"
            >
              {status.msg}
            </div>
          )}
        </form>
      </main>
    </>
  );
}

export default RecuperarSenhaParteEmail;
