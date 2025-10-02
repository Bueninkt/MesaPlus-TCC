import React, { useState } from "react";
// import { Link } from "react-router-dom"; // evite Link envolvendo o submit
import backimage from "../../assets/icons/backimage.png";
import check from '../../assets/icons/check.png'
import lockIcon from "../../assets/icons/lock.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";

import "./recuperarNovaSenha.css";

import navbarRegister from "../../components/navbar/navbarRegister";
const Navbar = navbarRegister;

function RecuperarNovaSenha() {
  // chaves coerentes e sem espaços
  const [form, setForm] = useState({ novaSenha: "", confirmarSenha: "" });

  // dois controles de visibilidade independentes
  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [status, setStatus] = useState({ type: "", msg: "", loading: false });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function onSubmit(e) {
    e.preventDefault();

    // validação nativa
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    // validação de igualdade
    if (form.novaSenha !== form.confirmarSenha) {
      setStatus({ type: "error", msg: "As senhas não coincidem.", loading: false });
      return;
    }

    setStatus({ type: "", msg: "", loading: true });

    const API_BASE = import.meta.env.VITE_API_URL || "http://10.107.144.13:8080/v1/mesa-plus";
    const url = `${API_BASE}/recuperarSenha`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // ajuste este payload para o que seu backend espera (ex.: token/código, email, etc.)
        body: JSON.stringify({
          senha: String(form.novaSenha).trim(),
          confirmarSenha: String(form.confirmarSenha).trim(),
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Falha ao recuperar senha.");
      }

      const data = await res.json();
      if (data.status) {
        setStatus({ type: "success", msg: "Senha atualizada com sucesso!", loading: false });
        // navegue programaticamente aqui se quiser
        // navigate("/");
      } else {
        setStatus({ type: "error", msg: data.message || "Falha em enviar.", loading: false });
      }
    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Erro ao conectar.", loading: false });
    }
  }

  return (
    <>
      <Navbar />

      <div
        className="imagemFundoRss"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />

      <main className="container-RecuperarNovaSenha">
        <div className="h1">Mesa+</div>
        <p>Recuperação Senha</p>

        <form onSubmit={onSubmit} noValidate>
          {/* NOVA SENHA */}
          <label className="novaSenha">
            <img className="imagemCadeado" src={lockIcon} alt="cadeado" aria-hidden="true" />

            <input
              type={showNova ? "text" : "password"}
              name="novaSenha"
              value={form.novaSenha}
              onChange={onChange}
              aria-label="Nova Senha"
              autoComplete="new-password"
              placeholder="Nova Senha:"
              required
              minLength={10}
            />

            <button
              type="button"
              className="olhoDois"
              onClick={() => setShowNova((s) => !s)}
              aria-label={showNova ? "Ocultar senha" : "Mostrar senha"}
              title={showNova ? "Ocultar senha" : "Mostrar senha"}
            >
              <img src={showNova ? eye : eyeclosed} alt="" aria-hidden="true" />
            </button>
          </label>

          {/* CONFIRMAR SENHA */}
          <label className="confirmarSenha">
            <img className="imagemCheck" src={check} alt="Check" aria-hidden="true" />

            <input
              type={showConf ? "text" : "password"}
              name="confirmarSenha"
              value={form.confirmarSenha}
              onChange={onChange}
              aria-label="Confirmar Senha"
              autoComplete="new-password"
              placeholder="Confirmar Senha:"
              required
              minLength={10}
            />

            <button
              type="button"
              className="olho"
              onClick={() => setShowConf((s) => !s)}
              aria-label={showConf ? "Ocultar senha" : "Mostrar senha"}
              title={showConf ? "Ocultar senha" : "Mostrar senha"}
            >
              <img src={showConf ? eye : eyeclosed} alt="" aria-hidden="true" />
            </button>
          </label>

          
          <button
            className="btnRecuperarNovaSenha btn--submitRecuperarNovaSenha"
            type="submit"
            disabled={status.loading}
          >
            {status.loading ? "Recuperado.." : "Recuperar Senha"}
          </button>

          {/* feedback simples (opcional) */}
          {status.msg && (
            <p
              role="status"
              style={{
                marginTop: 12,
                fontFamily: "Poppins",
                fontSize: 14,
                color: status.type === "error" ? "#b30000" : "#1B4227",
              }}
            >
              {status.msg}
            </p>
          )}
        </form>
      </main>
    </>
  );
}

export default RecuperarNovaSenha;
