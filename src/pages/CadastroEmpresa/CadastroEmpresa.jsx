import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./cadastroEmpresa.css";

import logo from "../../assets/icons/mesaLogo.png";
import profile from "../../assets/icons/profile.png";
import phone from  "../../assets/icons/phone.png";
import postCard from "../../assets/icons/postCard.png"; // ícone do doc (CNPJ/MEI)
import email from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import backimage from "../../assets/icons/backimage.png";

function CadastroEmpresaPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cnpj: ""             // CNPJ/MEI (14 dígitos)
  });
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });

  // ===== Máscaras =====
  const maskPhone = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) {
      return n.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, "($1) $2-$3").trim().replace(/[- ]$/, "");
    }
    return n.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, "($1) $2-$3").trim().replace(/[- ]$/, "");
  };
  const maskCNPJ = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 14);
    return n
      .replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2}).*/, "$1.$2.$3/$4-$5")
      .replace(/[.\-\/]$/, "");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "telefone") v = maskPhone(value);
    if (name === "cnpj") v = maskCNPJ(value);
    setForm((s) => ({ ...s, [name]: v }));
  };

  // ===== Submit =====
  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "", loading: true });

    if (!form.nome || !form.email || !form.senha || !form.telefone || !form.cnpj) {
      setStatus({ type: "error", msg: "Preencha todos os campos.", loading: false });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setStatus({ type: "error", msg: "E-mail inválido.", loading: false });
      return;
    }
    const cnpjDigits = form.cnpj.replace(/\D/g, "");
    if (cnpjDigits.length !== 14) {
      setStatus({ type: "error", msg: "CNPJ/MEI deve ter 14 dígitos.", loading: false });
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || "http://10.107.144.13:8080/v1/mesa-plus";
    const url = `${API_BASE}/empresa`; // ajuste conforme seu back-end

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          telefone: form.telefone.replace(/\D/g, ""),
          cnpj_mei: cnpjDigits 
        })
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha ao cadastrar.");
      }

      setStatus({ type: "success", msg: "Cadastro realizado com sucesso!", loading: false });
      setForm({ nome: "", email: "", senha: "", telefone: "", cnpj: "" });
    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Erro ao conectar ao servidor.", loading: false });
    }
  }

  return (
    <>
      {/* Cabeçalho com logo e Entrar */}
      <header className="ce__header" aria-label="Cabeçalho">
        <div className="container ce__headerGrid">
          <Link to="/" className="ce__homeLink" aria-label="Ir para Sobre Nós">
            <img className="ce__brandmark" src={logo} alt="Mesa+ logotipo" />
          </Link>
          <Link to="/login" className="btnCe btn--login">Entrar</Link>
        </div>
      </header>

      {/* Fundo com imagem */}
      <div
        className="ce__bg"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />

      {/* Painel central */}
      <main className="ce" aria-labelledby="ce-title">
        <section className="ce__panel" role="region" aria-label="Formulário de cadastro de empresa">
          <h1 id="ce-title" className="ce__brand">Mesa+</h1>
          <p className="ce__subtitle">Cadastrar Empresa</p>

          <form className="ce__form" onSubmit={onSubmit} noValidate>
            {/* Nome */}
            <label className="fieldCe">
              <img className="field__icon" src={profile} alt="" aria-hidden="true" />
              <span className="field__label">Nome:</span>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={onChange}
                aria-label="Nome"
                required
              />
            </label>

            {/* Email */}
            <label className="fieldCe">
              <img className="field__icon" src={email} alt="" aria-hidden="true" />
              <span className="field__label">Email:</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                aria-label="Email"
                required
              />
            </label>

            {/* Senha (toggle) */}
            <label className="fieldCe field--pwd">
              <img className="field__icon" src={lockIcon} alt="" aria-hidden="true" />
              <span className="field__label">Senha:</span>
              <input
                type={showPwd ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={onChange}
                aria-label="Senha"
                required
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPwd}
                title={showPwd ? "Ocultar senha" : "Mostrar senha"}
              >
                <img src={showPwd ? eye : eyeclosed} alt="" aria-hidden="true" />
              </button>
            </label>

            {/* Telefone */}
            <label className="fieldCe">
              <img className="field__icon" src={phone} alt="" aria-hidden="true" />
              <span className="field__label">Telefone:</span>
              <input
                type="tel"
                name="telefone"
                value={form.telefone}
                onChange={onChange}
                aria-label="Telefone"
                required
                inputMode="numeric"
              />
            </label>

            {/* CNPJ/MEI */}
            <label className="fieldCe">
              <img className="field__icon" src={postCard} alt="" aria-hidden="true" />
              <span className="field__label">CNPJ/MEI:</span>
              <input
                type="text"
                name="cnpj"
                value={form.cnpj}
                onChange={onChange}
                aria-label="CNPJ/MEI"
                required
                inputMode="numeric"
              />
            </label>

            <button className="btnCe btn--submitCe" type="submit" disabled={status.loading}>
              {status.loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            <div className={`ce__status ${status.type ? `ce__status--${status.type}` : ""}`} aria-live="polite">
              {status.msg}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default CadastroEmpresaPage;
