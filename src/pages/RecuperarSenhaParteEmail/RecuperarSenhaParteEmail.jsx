import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa o hook de navegação
import axios from "axios"; // Importa o axios
import { Link } from "react-router-dom";
import "./recuperarSenhaParteEmail.css";

import emailIcon from "../../assets/icons/email.png";
import seta from "../../assets/icons/seta.png";
import backimage from "../../assets/icons/backimage.png";
import navbarRegister from "../../components/navbar/navbarRegister";

const Navbar = navbarRegister;

function RecuperarSenhaParteEmail() {
  // Hook para navegação programática
  const navigate = useNavigate();

  // Estados para controlar os valores dos inputs, o carregamento e os erros
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Função para lidar com o envio do formulário
  const handleSubmit = async (event) => {
    event.preventDefault(); // Previne o recarregamento padrão da página
    setErrorMessage(""); // Limpa mensagens de erro anteriores

    // Validação simples no front-end
    if (!email || !tipo) {
      setErrorMessage("Por favor, preencha o e-mail e selecione o tipo.");
      return;
    }

    setLoading(true); // Ativa o estado de carregamento

    try {
      // Chamada para a API do back-end
      const response = await axios.post(
        "http://localhost:8080/v1/mesa-plus/enviar-codigo",
        {
          email: email,
          tipo: tipo,
        }
      );

      // Se a resposta for sucesso (status 200)
      if (response.status === 200) {
        // Navega para a próxima página, passando o email e tipo via state
        // Isso é importante para a próxima etapa de verificação
        navigate("/recuperarSenhaParteCodigo", { state: { email, tipo } });
      }
    } catch (error) {
      // Se a API retornar um erro
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("");
      }
    } finally {
      setLoading(false); // Desativa o estado de carregamento, independentemente do resultado
    }
  };

  return (
    <>
      <Navbar />

      <Link to="/recuperarSenhaParteCodigo"
      >entrar</Link>
      <div


        className="imagemFundo"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />
      <main className="container-Recuperar">
        <div className="h1">Mesa+</div>
        <p>Recuperação Senha</p>

        {/* O formulário agora chama a função handleSubmit */}
        <form onSubmit={handleSubmit}>
          <label>
            <img className="iconeEmail" src={emailIcon} alt="email" aria-hidden="true" />
            <span>Email:</span>
            <input
              type="email"
              name="email"
              aria-label="Email"
              autoComplete="email"
              inputMode="email"
              required
              value={email} // Conecta o valor do input ao estado 'email'
              onChange={(e) => setEmail(e.target.value)} // Atualiza o estado quando o usuário digita
            />
          </label>

          <div className="tipo-container">
            <select
              name="tipo"
              aria-label="Escolha o tipo de cadastro"
              required
              className="tipo-cadastro"
              style={{ backgroundImage: `url(${seta})` }}
              value={tipo} // Conecta o valor do select ao estado 'tipo'
              onChange={(e) => setTipo(e.target.value)} // Atualiza o estado quando o usuário seleciona uma opção
            >
              <option value="" disabled>Escolha o Tipo</option>
              <option value="pessoa">Pessoa</option>
              <option value="empresa">Empresa</option>
              <option value="ong">ONG</option>
            </select>
          </div>

          {/* Exibe a mensagem de erro, se houver */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <h2>Código enviado pelo e-mail</h2>

          <button
            className="btnRecuperar btn--submitRecuperar"
            type="submit"
            disabled={loading} // Desabilita o botão enquanto a requisição está em andamento
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </main>
    </>
  );
}

export default RecuperarSenhaParteEmail;