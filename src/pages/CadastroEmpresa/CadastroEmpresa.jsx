import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import "./cadastroEmpresa.css";

// --- Imports de Componentes e Ícones ---
import navbarRegister from "../../components/navbar/navbarRegister";
import profile from "../../assets/icons/profile.png";
import phone from "../../assets/icons/phone.png";
import postCard from "../../assets/icons/postCard.png"; 
import email from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import backimage from "../../assets/icons/backimage.png";
import local from "../../assets/icons/local.png"; // Ícone de endereço

const Navbar = navbarRegister;

// --- Lógica de Validação Centralizada ---
const validateField = (name, value) => {
  switch (name) {
    case "nome":
      if (!value) return "Nome é obrigatório.";
      if (!/^[A-ZÀ-ÖØ-Þ]/.test(value)) {
        return "O nome deve começar com letra maiúscula.";
      }
      return "";

    case "email":
      if (!value) return "Email é obrigatório.";
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(value)) return "";
      
      if (!value.includes("@")) return "Email deve conter um '@'.";
      const parts = value.split('@');
      if (parts.length !== 2 || parts[0].length === 0 || parts[1].length < 3) {
        return "Formato de email inválido.";
      }
      const domainPart = parts[1];
      if (!domainPart.includes('.')) return "O domínio precisa de um ponto.";
      const tld = domainPart.split('.').pop();
      if (tld.length < 2) return "Final do domínio inválido.";
      return "Formato de email inválido.";

    case "senha":
      if (!value) return "Senha é obrigatória.";
      if (!/(?=.*[A-Z])/.test(value) || !/(?=.*[a-z])/.test(value)) return "Deve conter uma letra maiúscula e uma minúscula";
      if (value.length >= 15 || value.length <= 9) return "Senha entre 10 e 14 caracteres.";
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return "Deve conter um caractere especial.";
      return "";

    case "telefone":
      const phoneDigits = value.replace(/\D/g, "");
      if (phoneDigits.length < 10) return "Telefone deve ter 10 ou 11 dígitos.";
      return "";

    case "cnpj":
      const cnpjDigits = value.replace(/\D/g, "");
      if (cnpjDigits.length !== 14) return "CNPJ/MEI deve ter 14 dígitos.";
      return "";

    // Validação do Endereço (Alinhado com Controller Node.js)
   case "endereco":
      if (!value || value.trim() === "") return "Endereço é obrigatório.";
      
      if (value.length > 150) return "O endereço deve ter no máximo 150 caracteres.";
      
      // --- NOVA VALIDAÇÃO ---
      // Regex que verifica se existe pelo menos uma letra (a-z, A-Z) 
      // ou letras com acentos (\u00C0-\u00FF inclui á, é, ã, ç, etc.)
      const temLetras = /[a-zA-Z\u00C0-\u00FF]/.test(value);
      
      if (!temLetras) {
        return "O endereço deve conter o nome da rua ou bairro.";
      }

      // Sugestão opcional: Adicionar um tamanho mínimo para evitar endereços como "Rua A" muito curtos
      if (value.trim().length < 5) {
        return "O endereço está muito curto.";
      }

      return "";

    default:
      return "";
  }
};
// --- Componente ---
function CadastroEmpresaPage() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    cnpj: "",
    endereco: ""
  });

  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  // --- Máscaras ---
  const maskPhone = (v) => {
    let n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length > 10) n = n.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (n.length > 6) n = n.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (n.length > 2) n = n.replace(/^(\d{2})(\d*)/, "($1) $2");
    else if (n.length > 0) n = n.replace(/^(\d*)/, "($1");
    return n;
  };

  const maskCNPJ = (v) => {
    return v.replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
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

  // --- ONSUBMIT ATUALIZADO ---
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
    
    // URL da API
    const API_BASE = import.meta.env.VITE_API_URL || "https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus";
    const url = `${API_BASE}/empresa`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          telefone: form.telefone.replace(/\D/g, ""),
          cnpj_mei: form.cnpj.replace(/\D/g, ""),
          endereco: form.endereco.trim() 
        })
      });

      if (!res.ok) {
        // Tenta ler o erro como JSON
        const errorData = await res.json().catch(() => null);

        // Se tiver mensagem vinda do backend, usa ela
        if (errorData && errorData.message) {
             throw new Error(errorData.message);
        }

        // Caso contrário, mensagem genérica amigável
        throw new Error("Não foi possível cadastrar. Verifique se os dados (CNPJ/Email) já estão em uso.");
      }

      setStatus({
        type: "success",
        msg: "Cadastro feito com sucesso!",
        loading: false
      });
      
      setForm({ nome: "", email: "", senha: "", telefone: "", cnpj: "", endereco: "" });

      if (redirectTimer.current) clearTimeout(redirectTimer.current);

      redirectTimer.current = setTimeout(() => {
        navigate("/login", { replace: true, state: { justRegistered: true } });
      }, 2470);

    } catch (err) {
      // Exibe a mensagem limpa
      setStatus({ type: "error", msg: err.message, loading: false });
    }
  }

  return (
    <>
      <Navbar />
      <div className="ce__bg" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true" />
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
                aria-label="Nome da empresa"
                required
                autoComplete="organization"
                aria-invalid={!!errors.nome}
                placeholder="insira primeiro nome"
                maxLength={15}
              />
              {errors.nome && <div className="ce__error-message" role="alert">{errors.nome}</div>}
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
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!errors.email}
                maxLength={45}
              />
              {errors.email && <div className="ce__error-message" role="alert">{errors.email}</div>}
            </label>

            {/* Senha */}
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
                maxLength={14}
                autoComplete="new-password"
                aria-invalid={!!errors.senha}
              />
              {errors.senha && <div className="ce__error-message" role="alert">{errors.senha}</div>}
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
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
                onChange={handleMask(maskPhone)}
                aria-label="Telefone"
                required
                inputMode="numeric"
                maxLength={15}
                aria-invalid={!!errors.telefone}
              />
              {errors.telefone && <div className="ce__error-message" role="alert">{errors.telefone}</div>}
            </label>

            {/* CNPJ */}
            <label className="fieldCe">
              <img className="field__icon" src={postCard} alt="" aria-hidden="true" />
              <span className="field__label">CNPJ/MEI:</span>
              <input
                type="text"
                name="cnpj"
                value={form.cnpj}
                onChange={handleMask(maskCNPJ)}
                aria-label="CNPJ/MEI"
                required
                inputMode="numeric"
                maxLength={18}
                aria-invalid={!!errors.cnpj}
              />
              {errors.cnpj && <div className="ce__error-message" role="alert">{errors.cnpj}</div>}
            </label>

            {/* Endereço */}
            <label className="fieldCe">
              <img className="field__icon" src={local} alt="" aria-hidden="true" />
              <span className="field__label">Endereço:</span>
              <input
                type="text"
                name="endereco"
                value={form.endereco}
                onChange={onChange}
                aria-label="Endereço Completo"
                required
                maxLength={170}
                autoComplete="street-address"
                aria-invalid={!!errors.endereco}
              />
              {errors.endereco && <div className="ce__error-message" role="alert">{errors.endereco}</div>}
            </label>

            <button
              className="btnCe btn--submitCe"
              type="submit"
              disabled={status.loading || status.type === "success"}
            >
              {status.loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            <div
              className={`ce__status ${status.type ? `ce__status--${status.type}` : ""}`}
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

export default CadastroEmpresaPage;