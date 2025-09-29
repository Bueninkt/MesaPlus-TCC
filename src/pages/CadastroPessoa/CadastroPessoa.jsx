import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./cadastroPessoa.css";

import logo from "../../assets/icons/mesaLogo.png";
import profile from "../../assets/icons/profile.png";
import phone from "../../assets/icons/phone.png";
import postCard from "../../assets/icons/postCard.png";
import email from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import backimage from "../../assets/icons/backimage.png";

function CadastroPessoaPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cpf: ""
  });
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });

  // ================== Máscaras rápidas ==================
  const maskPhone = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) {
      return n.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, "($1) $2-$3").trim().replace(/[- ]$/, "");
    }
    return n.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, "($1) $2-$3").trim().replace(/[- ]$/, "");
  };
  const maskCPF = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, "$1.$2.$3-$4").replace(/[.\-]$/, "");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "telefone") v = maskPhone(value);
    if (name === "cpf") v = maskCPF(value);
    setForm((s) => ({ ...s, [name]: v }));
  };

  // ================== Submit ==================
  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "", loading: true });

    if (!form.nome || !form.email || !form.senha || !form.telefone || !form.cpf) {
      setStatus({ type: "error", msg: "Preencha todos os campos.", loading: false });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setStatus({ type: "error", msg: "E-mail inválido.", loading: false });
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || "http://10.107.144.13:8080/v1/mesa-plus";
    const url = `${API_BASE}/usuario`; // ajuste se necessário

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          cpf: form.cpf.replace(/\D/g, ""),
          telefone: form.telefone.replace(/\D/g, ""),
          
        })
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha ao cadastrar.");
      }

      setStatus({ type: "success", msg: "Cadastro realizado com sucesso!", loading: false });
      setForm({ nome: "", email: "", senha: "", telefone: "", cpf: "" });
    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Erro ao conectar ao servidor.", loading: false });
    }
  }

  return (
    <>
      {/* Cabeçalho com logo (link para /) e botão Entrar */}
      <header className="cp__header" aria-label="Cabeçalho">
        <div className="container cp__headerGrid">
          <Link to="/" className="cp__homeLink" aria-label="Ir para Sobre Nós">
            <img className="cp__brandmark" src={logo} alt="Mesa+ logotipo" />
          </Link>
          <Link to="/login" className="btn btn--login">Entrar</Link>
        </div>
      </header>

      {/* Fundo com imagem (padrão sutil) */}
      <div
        className="cp__bg"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />

      {/* Painel central */}
      <main className="cp" aria-labelledby="cp-title">
        <section className="cp__panel" role="region" aria-label="Formulário de cadastro">
          <h1 id="cp-title" className="cp__brand">Mesa+</h1>
          <p className="cp__subtitle">Cadastrar Pessoa</p>

          <form className="cp__form" onSubmit={onSubmit} noValidate>
            {/* Nome */}
            <label className="field">
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
            <label className="field">
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
            <label className="field field--pwd">
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
            <label className="field">
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

            {/* CPF */}
            <label className="field">
              <img className="field__icon" src={postCard} alt="" aria-hidden="true" />
              <span className="field__label">CPF:</span>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={onChange}
                aria-label="CPF"
                required
                inputMode="numeric"
              />
            </label>

            <button className="btn btn--submit" type="submit" disabled={status.loading}>
              {status.loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            <div className={`cp__status ${status.type ? `cp__status--${status.type}` : ""}`} aria-live="polite">
              {status.msg}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default CadastroPessoaPage;
