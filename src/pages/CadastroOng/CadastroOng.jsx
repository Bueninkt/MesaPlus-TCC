import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./cadastroOng.css";

// --- Imports de Componentes e Ícones ---
import navbarRegister from "../../components/navbar/navbarRegister";
import profile from "../../assets/icons/profile.png";
import phone from "../../assets/icons/phone.png";
import email from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import backimage from "../../assets/icons/backimage.png";

const Navbar = navbarRegister;

// --- Lógica de Validação Centralizada e em Tempo Real ---
const validateField = (name, value) => {
  switch (name) {
    case "nome":
      if (!value) return "Nome da ONG é obrigatório.";
      if (!/^[A-ZÀ-ÖØ-Þ]/.test(value)) {
          return "O nome deve começar com letra maiúscula.";
      }
      return "";

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
        return "Formato de email inválido (ex: nome@dominio.org).";
      }

      const domainPart = parts[1];
      if (!domainPart.includes('.')) {
        return "O domínio do email precisa de um ponto (ex: dominio.org).";
      }

      const tld = domainPart.split('.').pop();
      if (tld.length < 2) {
        return "O final do domínio deve ter pelo menos 2 letras (ex: .org, .br).";
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

    default:
      return "";
  }
};


// --- Componente ---
function CadastroOngPage() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });

  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });
  
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  // --- Máscara de Telefone (padrão do projeto) ---
  const maskPhone = (v) => {
    // Remove todos os caracteres que não são dígitos e limita a 11
    let n = v.replace(/\D/g, "").slice(0, 11);

    // Aplica a máscara de forma progressiva com base no tamanho do input
    if (n.length > 10) {
      // Formato para celular com 11 dígitos: (XX) XXXXX-XXXX
      n = n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (n.length > 6) {
      // Formato para telefone com 7 a 10 dígitos: (XX) XXXX-XXXX
      n = n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (n.length > 2) {
      // Formato para quando o usuário começa a digitar o número após o DDD
      n = n.replace(/^(\d{2})(\d*)/, "($1) $2");
    } else if (n.length > 0) {
      // Formato para quando o usuário está digitando o DDD
      n = n.replace(/^(\d*)/, "($1");
    }

    return n;
  };

  // --- Handlers ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleMask = (maskFn) => (e) => {
    const { name, value } = e.target;
    const maskedValue = maskFn(value);
    setForm((s) => ({ ...s, [name]: maskedValue }));
    const errorMessage = validateField(name, maskedValue);
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
                aria-label="Nome da ONG"
                required
                aria-invalid={!!errors.nome}
                autoComplete="organization"
              />
              {errors.nome && <div className="co__error-message" role="alert">{errors.nome}</div>}
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
                aria-label="Email"
                required
                aria-invalid={!!errors.email}
                inputMode="email"
                autoComplete="email"
              />
              {errors.email && <div className="co__error-message" role="alert">{errors.email}</div>}
            </label>

            {/* Senha */}
            <label className="fieldCo field--pwd">
              <img className="field__icon" src={lockIcon} alt="" aria-hidden="true" />
              <span className="field__label">Senha:</span>
              <input
                type={showPwd ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={onChange}
                aria-label="Senha"
                minLength={10}
                maxLength={14}
                required
                aria-invalid={!!errors.senha}
                autoComplete="new-password"
              />
               {errors.senha && <div className="co__error-message" role="alert">{errors.senha}</div>}
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
            <label className="fieldCo">
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
                autoComplete="tel"
              />
              {errors.telefone && <div className="co__error-message" role="alert">{errors.telefone}</div>}
            </label>

            <button
              className="btnCo btn--submitCo"
              type="submit"
              disabled={status.loading || status.type === "success"}
            >
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