
import React, { useState } from "react";
import emailIcon from "../../assets/icons/email.png";

import { Link } from "react-router-dom";
import "./recuperarSenhaParteEmail.css";

import navbarRegister from "../../components/navbar/navbarRegister";

const Navbar = navbarRegister
function RecuperarSenhaParteEmail() {
     const [form, setForm] = useState({ email: "", senha: "", tipo: "" });
      const [showPwd, setShowPwd] = useState(false);
      const [status, setStatus] = useState({ type: "", msg: "", loading: false });
    
      const onChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
      };
    
      async function onSubmit(e) {
        e.preventDefault();
    
        // usa SOMENTE validação nativa (HTML5)
        const formEl = e.currentTarget; // <form>
        if (!formEl.checkValidity()) {
          formEl.reportValidity(); // mostra os balões padrões
          return;
        }
    
        setStatus({ type: "", msg: "", loading: true });
    
        const API_BASE = import.meta.env.VITE_API_URL || "http://10.107.144.13:8080/v1/mesa-plus";
        const url = `${API_BASE}/recuperarSenha`;
    
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              email: String(form.email).trim(),
              senha: String(form.senha)
            })
          });
    
          if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || "Falha no login.");
          }
    
          const data = await res.json();
          if (data.status && data.usuario) {
            localStorage.setItem("userType", form.tipo);
            localStorage.setItem("user", JSON.stringify(data.usuario));
            setStatus({ type: "success", msg: "Login efetuado!", loading: false });
            // navigate("/");
          } else {
            setStatus({ type: "error", msg: data.message || "Falha no login.", loading: false });
          }
        } catch (err) {
          setStatus({ type: "error", msg: err.message || "Erro ao conectar.", loading: false });
        }
      }

    return  (
        <>
            <Navbar />
            <main className="container-Recuperar">
                <div className="h1">
                    Mesa+
                </div>
                
                <p>Recuperação Senha</p>

                <form onSubmit={onSubmit}>
                    <label >
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

                    <h2>Codigo enviado pelo email</h2>

                    <button className="btnRecuperar btn--submitRecuperar" type="submit" disabled={status.loading}>
                    {status.loading ? "Validando..." : "Validar"} </button>
                </form>
                
            </main>

        </>
    );
};



export default RecuperarSenhaParteEmail









