import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./cadastroPessoa.css";

// --- Validações ---
const validateField = (name, value) => {
  switch (name) {
    case "nome":
      if (!value) return "Nome é obrigatório.";

      // Nova validação: Verifica apenas se o primeiro caractere é uma letra maiúscula.
      // Isso permite qualquer tamanho de nome (Ex: "Ana", "Carlos de Andrade", "Maria da Silva Sauro").
      if (!/^[A-ZÀ-ÖØ-Þ]/.test(value)) {
        return "O nome deve começar com letra maiúscula.";
      }

      return ""; // Válido se passar pelas checagens

    case "email":
      if (!value) return "Email é obrigatório.";

      // A expressão regular principal já valida a maioria dos casos.
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(value)) {
        return ""; // Se for válido, retorna sucesso.
      }

      // Se a regex falhar, damos erros mais específicos.
      if (!value.includes("@")) {
        return "Email deve conter um '@'.";
      }
      
      const parts = value.split('@');
      if (parts.length !== 2 || parts[0].length === 0 || parts[1].length < 3) {
        return "Formato de email inválido (ex: nome@dominio.com).";
      }

      const domainPart = parts[1];
      if (!domainPart.includes('.')) {
        return "O domínio do email precisa de um ponto (ex: dominio.com).";
      }

      const tld = domainPart.split('.').pop();
      if (tld.length < 2) {
        return "O final do domínio (após o último ponto) deve ter pelo menos 2 letras (ex: .com, .br).";
      }

      // Erro genérico se nenhuma das condições específicas for atendida.
      return "Formato de email inválido.";

    case "senha":
      if (!value) return "Senha é obrigatória.";
      if (!/(?=.*[A-Z])/.test(value) || !/(?=.*[a-z])/.test(value)) return "Deve conter uma letra maiúscula e uma minuscula";
      if (value.length >= 15 || value.length <= 9) return "Senha no mínimo 10 caracteres.";
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return "Deve conter um caractere especial.";
      return "";

    case "telefone":
      const phoneDigits = value.replace(/\D/g, "");
      if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";

    case "cpf":
      const cpfDigitsOnly = value.replace(/\D/g, "");
      if (cpfDigitsOnly.length !== 11) return "CPF deve ter 11 dígitos.";
      // Supondo que a função validateCPF será usada no futuro
      // return validateCPF(value); 
      return "";

    default:
      return "";
  }
};


// --- Componente ---
import navbarRegister from "../../components/navbar/navbarRegister";
import profile from "../../assets/icons/profile.png";
import phone from "../../assets/icons/phone.png";
import postCard from "../../assets/icons/postCard.png";
import email from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import backimage from "../../assets/icons/backimage.png";

const Navbar = navbarRegister;

function CadastroPessoaPage() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cpf: ""
  });

  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleMask = (maskFn) => (e) => {
    const { name, value } = e.target;
    const maskedValue = maskFn(value);
    setForm((s) => ({ ...s, [name]: maskedValue }));
    const errorMessage = validateField(name, maskedValue);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const maskPhone = (v) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) {
      return n.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return n.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const maskCPF = (v) => {
    return v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    
    const formErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) {
        formErrors[key] = error;
      }
    });

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      setStatus({ type: "error", msg: "Por favor, corrija os campos inválidos.", loading: false });
      return;
    }

    setStatus({ type: "", msg: "", loading: true });
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/v1/mesa-plus";
    const url = `${API_BASE}/usuario`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          cpf: form.cpf.replace(/\D/g, ""),
          telefone: form.telefone.replace(/\D/g, "")
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

      setForm({ nome: "", email: "", senha: "", telefone: "", cpf: "" });

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
      <div className="cp__bg" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true" />
      <main className="cp" aria-labelledby="cp-title">
        <section className="cp__panel" role="region" aria-label="Formulário de cadastro">
          <h1 id="cp-title" className="cp__brand">Mesa+</h1>
          <p className="cp__subtitle">Cadastrar Pessoa</p>
          <form className="cp__form" onSubmit={onSubmit} noValidate>
            
            <label className="fieldCp">
              <img className="field__icon" src={profile} alt="" aria-hidden="true" />
              <span className="field__label">Nome:</span>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={onChange}
                aria-label="Nome"
                required
                autoComplete="name"
                aria-invalid={!!errors.nome}
              />
              {errors.nome && <div className="cp__error-message" role="alert">{errors.nome}</div>}
            </label>

            <label className="fieldCp">
              <img className="field__icon" src={email} alt="" aria-hidden="true" />
              <span className="field__label">Email:</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                aria-label="Email"
                required
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && <div className="cp__error-message" role="alert">{errors.email}</div>}
            </label>

            <label className="fieldCp field--pwd">
              <img className="field__icon" src={lockIcon} alt="" aria-hidden="true" />
              <span className="field__label">Senha:</span>
              <input
                type={showPwd ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={onChange}
                aria-label="Senha"
                required
                minLength={10}
                maxLength={14}
                autoComplete="new-password"
                aria-invalid={!!errors.senha}
              />
              {errors.senha && <div className="cp__error-message" role="alert">{errors.senha}</div>}
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

            <label className="fieldCp">
              <img className="field__icon" src={phone} alt="" aria-hidden="true" />
              <span className="field__label">Telefone:</span>
              <input
                type="tel"
                name="telefone"
                value={form.telefone}
                onChange={handleMask(maskPhone)}
                aria-label="Telefone"
                required
                inputMode="numeric"
                maxLength={15}
                aria-invalid={!!errors.telefone}
              />
              {errors.telefone && <div className="cp__error-message" role="alert">{errors.telefone}</div>}
            </label>

            <label className="fieldCp">
              <img className="field__icon" src={postCard} alt="" aria-hidden="true" />
              <span className="field__label">CPF:</span>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleMask(maskCPF)}
                aria-label="CPF"
                required
                inputMode="numeric"
                maxLength={14}
                autoComplete="off"
                aria-invalid={!!errors.cpf}
              />
              {errors.cpf && <div className="cp__error-message" role="alert">{errors.cpf}</div>}
            </label>

            <button
              className="btnCp btn--submitCp"
              type="submit"
              disabled={status.loading || status.type === "success"}
            >
              {status.loading ? "Cadastrando..." : "Cadastrar"}
            </button>
            
            <div 
              className={`cp__status ${status.type ? `cp__status--${status.type}` : ""}`} 
              aria-live="polite"
            >
              {status.msg}
            </div>

          </form>
        </section>
      </main>
    </>
  );
}

export default CadastroPessoaPage;