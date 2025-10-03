
import React, { useState } from "react";

import { Link } from "react-router-dom";
import backimage from "../../assets/icons/backimage.png";
import "./recuperarSenhaParteCodigo.css";

import navbarRegister from "../../components/navbar/navbarRegister";

const Navbar = navbarRegister
function RecuperarSenhaParteCodigo() {
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
    
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/v1/mesa-plus";
        const url = `${API_BASE}/codigo-recuperacao`;
    
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
            setStatus({ type: "error", msg: data.message || "Falha em enviar.", loading: false });
          }
        } catch (err) {
          setStatus({ type: "error", msg: err.message || "Erro ao conectar.", loading: false });
        }
      }

    return  (
        <>
            <Navbar />

            <div className="imagemFundoRsc" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true" />


            <main className="container-RecuperarSenhaParteCodigo">
                <div className="h1">
                    Mesa+
                </div>
                
                <p>Recuperação Senha</p>

                <form>
                    <label >
                        <input
                            type="text"
                            name="codigo"
                            aria-label="Codigo"
                            inputMode="numeric"
                            placeholder="Insira o código: "
                            required
                        />
                    </label>

                    <h2>Codigo enviado pelo email</h2>

                    <Link to= '/recuperarNovaSenha'>
                    <button className="btnRecuperarSenhaParteCodigo btn--submitRecuperarSenhaParteCodigo" type="submit" disabled={status.loading}>
                    {status.loading ? "Codigo Verificado!" : "Verificar Codigo"} </button>
                    </Link>
                </form>
                
            </main>

        </>
    );
};



export default RecuperarSenhaParteCodigo









