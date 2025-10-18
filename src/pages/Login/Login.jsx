import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

// --- Imports de Ícones e Imagens ---
import logo from "../../assets/icons/mesaLogo.png";
import emailIcon from "../../assets/icons/email.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import lockIcon from "../../assets/icons/lock.png";
import seta from "../../assets/icons/seta.png";
import backimage from "../../assets/icons/backimage.png";

// --- Lógica de Validação Centralizada ---
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
        return "Formato de email inválido (ex: nome@dominio.com).";
      }

      const domainPart = parts[1];
      if (!domainPart.includes('.')) {
        return "O domínio do email precisa de um ponto (ex: dominio.).";
      }

      const tld = domainPart.split('.').pop();
      if (tld.length < 2) {
        return "O final do domínio deve ter pelo menos 2 letras (ex: .com, .br).";
      }

      // Erro genérico se nenhuma das condições específicas for atendida.
      return "Formato de email inválido.";

    case "senha":
      if (!value) return "Senha é obrigatória.";
      if (!/(?=.*[A-Z])/.test(value) || !/(?=.*[a-z])/.test(value)) return "Deve conter uma letra maiúscula e uma minuscula";
      if (value.length >= 15 || value.length <= 9) return "Senha no mínimo 10 caracteres.";
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return "Deve conter um caractere especial.";
      return "";

    case "tipo":
      if (!value) return "Você precisa escolher um tipo de login.";
      return "";

    default:
      return "";
  }
};

function LoginPage() {
  const [form, setForm] = useState({ email: "", senha: "", tipo: "" });
  const [errors, setErrors] = useState({}); // ⬅️ Estado para os erros
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", loading: false });
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    // Validação em tempo real
    const errorMessage = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  async function onSubmit(e) {
    e.preventDefault();

    // 1. Valida todos os campos antes de enviar
    const formErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) {
        formErrors[key] = error;
      }
    });

    setErrors(formErrors);

    // 2. Se houver erros, interrompe a submissão
    if (Object.keys(formErrors).length > 0) {
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

      // --- INÍCIO DA MODIFICAÇÃO ---
      if (!res.ok) {
        // Verifica se o status da resposta é 404 (Não Encontrado) ou 401 (Não Autorizado),
        // que são comumente usados para credenciais inválidas.
        if (res.status === 404 || res.status === 401) {
          // Lança um erro com a mensagem amigável e fixa.
          throw new Error("Email ou senha ou tipo incorretos.");
        } 
        
        // Para qualquer outro tipo de erro (ex: 500 Internal Server Error),
        // mantém o comportamento original de tentar extrair a mensagem da API.
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha no login. Tente novamente mais tarde.");
      }
      // --- FIM DA MODIFICAÇÃO ---

      const data = await res.json();
      // ... dentro do try ...
      if (data.status && data.usuario) {
        localStorage.setItem("userType", form.tipo);
        localStorage.setItem("user", JSON.stringify(data.usuario));
        setStatus({
          type: "success",
          msg: "Login Realizado",
          loading: false
        });

        // --- INÍCIO DO AGENTE DE REDIRECIONAMENTO ---

        // 1. Define uma rota padrão caso algo dê errado.
        let destinationPath = '/login'; 

        // 2. Decide a rota correta com base no tipo de login.
        switch (form.tipo) {
          case 'empresa':
            // Usando o seu exemplo: pode ser a página de perfil da empresa.
            destinationPath = '/sobreNosEmpresa'; 
            break;
          case 'pessoa':
            // Exemplo: levar para o dashboard pessoal.
            destinationPath = '/sobreNosUsuario'; 
            break;
          case 'ong':
            // Exemplo: levar para a página de gerenciamento da ONG.
            destinationPath = '/sobreNosOng';
            break;
          default:
            // Se o tipo for desconhecid  o, vai para a rota padrão definida acima.
            console.warn(`${form.tipo}.Algo Deu errado.`);
            break;
        }

        // 3. Executa a navegação para a rota decidida.
        setTimeout(() => {
          navigate(destinationPath, { replace: true });
        }, 2470); // Mantém o mesmo tempo de espera para a mensagem de sucesso ser lida.

      } else {
        // Se a resposta for OK (status 200) mas a API indicar falha no corpo do JSON.
        setStatus({ type: "error", msg: data.message || "Falha no login.", loading: false });
      }
    } catch (err) {
      // Este bloco 'catch' agora receberá a mensagem personalizada ou a da API,
      // e a exibirá para o usuário.
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

          <form className="lg__form" onSubmit={onSubmit} noValidate> {/* ⬅️ noValidate adicionado */}
            {/* Email */}
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
                aria-invalid={!!errors.email}
              />
              {errors.email && <div className="lg__error-message" role="alert">{errors.email}</div>}
            </label>

            {/* Senha */}
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
                maxLength={14}
                minLength={10}
      
                required
                aria-invalid={!!errors.senha}
              />
              {errors.senha && <div className="lg__error-message" role="alert">{errors.senha}</div>}
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

            {/* Tipo de login */}
            <div className="selectField">
              <select
                name="tipo"
                value={form.tipo}
                onChange={onChange}
                aria-label="Escolha o tipo de login"
                required
                className="selectField__select"
                style={{ backgroundImage: `url(${seta})` }}
                aria-invalid={!!errors.tipo}
              >
                <option value="" disabled>Escolha o Login</option>
                <option value="pessoa">Pessoa</option>
                <option value="empresa">Empresa</option>
                <option value="ong">ONG</option>
              </select>
              {errors.tipo && <div className="lg__error-message" role="alert">{errors.tipo}</div>}
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
            )

    </>
  );
}

export default LoginPage;