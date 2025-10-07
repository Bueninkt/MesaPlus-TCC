import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./cadastroOng.css";

// --- Adicione este CSS ao seu arquivo cadastroOng.css para estilizar os erros ---
/*
.field__error {
  color: #d32f2f;
  font-size: 0.75rem;
  text-align: left;
  margin-top: 4px;
  width: 100%;
  padding-left: 5px;
}

*/
// ---------------------------------------------------------------------------------

import navbarRegister from "../../components/navbar/navbarRegister";

import profile from "../../assets/icons/profile.png";
import phone from "../../assets/icons/phone.png";
import email from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import backimage from "../../assets/icons/backimage.png";

const Navbar = navbarRegister;

function CadastroOngPage() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null); // NOVO: Adicionado para consistência

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });

  // NOVO: Estado para armazenar os erros de validação dos campos
  const [errors, setErrors] = useState({});

  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });
  
  // NOVO: Hook para limpar o timer
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);


  const maskPhone = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) {
      return n.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, "($1) $2-$3").trim().replace(/[- ]$/, "");
    }
    return n.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, "($1) $2-$3").trim().replace(/[- ]$/, "");
  };

  // ALTERADO: Função onChange para incluir a lógica do nome e limpar erros
  const onChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    
    // Limpa o erro do campo atual ao começar a digitar
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === "nome") {
        // Garante que a primeira letra seja sempre maiúscula
        v = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (name === "telefone") {
        v = maskPhone(value);
    }
    
    setForm((s) => ({ ...s, [name]: v }));
  };

  // NOVO: Função de validação para ser usada no onBlur
  const validateField = (name, value) => {
    let errorMsg = null;
    if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
            errorMsg = "Formato de e-mail inválido. Ex: seuemail@dominio.com";
        }
    }
    return errorMsg;
  }
  
  // NOVO: Handler para o evento onBlur (quando o usuário sai do campo)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // NOVO: Função para validar o formulário inteiro antes do envio
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nome) newErrors.nome = "O nome é obrigatório.";
    
    const emailError = validateField("email", form.email);
    if (emailError) newErrors.email = emailError;
    if (!form.email) newErrors.email = "O e-mail é obrigatório.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ALTERADO: Função onSubmit para incluir a validação final
  async function onSubmit(e) {
    e.preventDefault();
    
    // Executa a validação antes de prosseguir
    if (!validateForm()) {
        return; // Interrompe o envio se houver erros
    }

    setStatus({ type: "", msg: "", loading: true });
    
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/v1/mesa-plus";
    const url = `${API_BASE}/ong`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          telefone: form.telefone.replace(/\D/g, ""),
        })
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha ao cadastrar.");
      }
      
      setStatus({
        type: "success",
        msg: "Cadastro feito com sucesso!",
        loading: false
      });
      setForm({ nome: "", email: "", senha: "", telefone: "" });

      // ALTERADO: Usando useRef para o timer
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
      redirectTimer.current = setTimeout(() => {
        navigate("/login", { replace: true, state: { justRegistered: true } });
      }, 2470);

    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Erro ao conectar ao servidor.", loading: false });
    }
  }

  return (
    <>
      <Navbar />
      <div
        className="co__bg"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />
      <main className="co" aria-labelledby="co-title">
        <section className="co__panel" role="region" aria-label="Formulário de cadastro ONG">
          <h1 id="co-title" className="co__brand">Mesa+</h1>
          <p className="co__subtitle">Cadastrar ONG</p>

          <form className="co__form" onSubmit={onSubmit} noValidate>
            {/* Nome */}
            <label className="fieldCo">
              <img className="field__icon" src={profile} alt="" aria-hidden="true" />
              <span className="field__label">Nome:</span>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={onChange}
                onBlur={handleBlur} // NOVO
                aria-label="Nome"
                required
                aria-invalid={!!errors.nome}
              />
              {/* NOVO: Exibe a mensagem de erro */}
              {errors.nome && <div className="field__error" role="alert">{errors.nome}</div>}
            </label>

            {/* Email */}
            <label className="fieldCo">
              <img className="field__icon" src={email} alt="" aria-hidden="true" />
              <span className="field__label">Email:</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                onBlur={handleBlur} // NOVO
                aria-label="Email"
                required
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {/* NOVO: Exibe a mensagem de erro */}
              {errors.email && <div id="email-error" className="field__error" role="alert">{errors.email}</div>}
            </label>

            {/* Senha (sem alterações) */}
            <label className="fieldCo field--pwd">
              <img className="field__icon" src={lockIcon} alt="" aria-hidden="true" />
              <span className="field__label">Senha:</span>
              <input
                type={showPwd ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={onChange}
                aria-label="Senha"
                minLength={8}
                maxLength={10}
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

            {/* Telefone (sem alterações de lógica) */}
            <label className="fieldCo">
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

            <button className="btnCo btn--submitCo" type="submit" disabled={status.loading}>
              {status.loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            <div className={`co__status ${status.type ? `co__status--${status.type}` : ""}`} aria-live="polite">
              {status.msg}
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default CadastroOngPage;