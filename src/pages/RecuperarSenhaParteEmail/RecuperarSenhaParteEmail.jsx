import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./recuperarSenhaParteEmail.css";

// --- Imports de Ícones e Imagens ---
import emailIcon from "../../assets/icons/email.png";
import seta from "../../assets/icons/seta.png";
import backimage from "../../assets/icons/backimage.png";
import navbarRegister from "../../components/navbar/navbarRegister";

const Navbar = navbarRegister;

// --- Lógica de Validação Centralizada (copiada de LoginPage) ---
const validateField = (name, value) => {
  switch (name) {
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



    case "tipo":
      if (!value) return "Você precisa escolher um tipo de login.";
      return "";

    default:
      return "";
  }
};

function RecuperarSenhaParteEmail() {
  const navigate = useNavigate();

  // Estado unificado para o formulário e erros, como em LoginPage
  const [form, setForm] = useState({ email: "", tipo: "" });
  const [errors, setErrors] = useState({});

  // Estado para o status da submissão (API)
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  // Função `onChange` que valida em tempo real
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Limpa mensagens de API anteriores
    setStatus({ loading: true, error: "", success: "" });

    // 2. Valida todos os campos antes de enviar
    const formErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) {
        formErrors[key] = error;
      }
    });

    setErrors(formErrors);

    // 3. Interrompe a submissão se houver erros de validação
    if (Object.keys(formErrors).length > 0) {
      setStatus({ loading: false, error: "", success: "" }); // Reseta o loading
      return;
    }

    try {
      // 4. Faz a chamada da API
      const response = await axios.post(
        "https://mesaplus-bbh2hhheaab7f6ep.canadacentral-01.azurewebsites.net/v1/mesa-plus/enviar-codigo",
        { email: form.email, tipo: form.tipo }
      );

      setStatus({
        loading: false,
        error: "",
        success: response.data.message || "Código enviado! Redirecionando..."
      });

      // ======================= MUDANÇA APLICADA AQUI =======================
      // 5. Salva os dados no localStorage para que a próxima tela possa usá-los.
      localStorage.setItem('email', form.email);
      localStorage.setItem('userType', form.tipo);
      // =====================================================================

      // 6. Navega para a próxima página após um breve delay
      setTimeout(() => {
        // Agora navegamos sem passar o "state", pois os dados já estão no localStorage
        navigate("/recuperarSenhaParteCodigo");
      }, 2500);

    } catch (error) {
      // 7. Trata erros da API
      const errorMessage = error.response?.data?.message ||
        "Não foi possível conectar ao servidor. Tente novamente.";
      setStatus({ loading: false, error: errorMessage, success: "" });
    }
  };

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

        <form onSubmit={handleSubmit} noValidate>
          {/* Campo de Email */}
          <label>
            <img className="iconeEmail" src={emailIcon} alt="" aria-hidden="true" />
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
              disabled={status.loading || status.success}
              aria-invalid={!!errors.email}
            />
          </label>
          {errors.email && <p className="field-error-message" role="alert">{errors.email}</p>}


          {/* Campo de Tipo */}
          <div className="tipo-container">
            <select
              name="tipo"
              value={form.tipo}
              onChange={onChange}
              aria-label="Escolha o tipo de cadastro"
              required
              className="tipo-cadastro"
              style={{ backgroundImage: `url(${seta})` }}
              disabled={status.loading || status.success}
              aria-invalid={!!errors.tipo}
            >
              <option value="" disabled>Escolha o Tipo</option>
              <option value="pessoa">Pessoa</option>
              <option value="empresa">Empresa</option>
              <option value="ong">ONG</option>
            </select>
          </div>
          {errors.tipo && <p className="field-error-message" role="alert">{errors.tipo}</p>}


          {/* Exibição de mensagens de status da API */}
          {status.error && <p className="api-status-message api-status-message--error">{status.error}</p>}
          {status.success && <p className="api-status-message api-status-message--success">{status.success}</p>}


          <h2>Código enviado pelo e-mail</h2>

          <button
            className="btnRecuperar btn--submitRecuperar"
            type="submit"
            disabled={status.loading || status.success}
          >
            {status.loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </main>
    </>
  );

}

export default RecuperarSenhaParteEmail;