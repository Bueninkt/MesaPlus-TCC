import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Importações de assets e CSS
import backimage from "../../assets/icons/backimage.png";
import check from '../../assets/icons/check.png';
import lockIcon from "../../assets/icons/lock.png";
import eye from "../../assets/icons/eye.png";
import eyeclosed from "../../assets/icons/eye-closed.png";
import "./recuperarNovaSenha.css";

// Importação do componente Navbar
import navbarRegister from "../../components/navbar/navbarRegister";
const Navbar = navbarRegister;

// Componente para exibir os critérios de validação da senha
const PasswordCriteria = ({ criteria }) => (
  <div className="password-criteria">
    <p className={criteria.length ? 'valid' : 'invalid'}>
      {criteria.length ? '✓' : '✗'} Mínimo de 10 e máximo de 14 caracteres
    </p>
    <p className={criteria.uppercase ? 'valid' : 'invalid'}>
      {criteria.uppercase ? '✓' : '✗'} Pelo menos uma letra maiúscula
    </p>
    <p className={criteria.lowercase ? 'valid' : 'invalid'}>
      {criteria.lowercase ? '✓' : '✗'} Pelo menos uma letra minúscula
    </p>
    <p className={criteria.specialChar ? 'valid' : 'invalid'}>
      {criteria.specialChar ? '✓' : '✗'} Pelo menos um caractere especial (!@#$%)
    </p>
    <p className={criteria.match ? 'valid' : 'invalid'}>
      {criteria.match ? '✓' : '✗'} As senhas coincidem
    </p>
  </div>
);


function RecuperarNovaSenha() {
  const navigate = useNavigate();

  // --- Gerenciamento de Estado ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNova, setShowNova] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [validationCriteria, setValidationCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
    match: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' });

  // --- Validação em Tempo Real ---
  useEffect(() => {
    const length = password.length >= 10 && password.length <= 14;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const specialChar = /[!@#$%^&*]/.test(password);
    const match = password !== '' && password === confirmPassword;

    setValidationCriteria({ length, uppercase, lowercase, specialChar, match });
  }, [password, confirmPassword]);

  // --- Lógica de Submissão do Formulário ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verifica se todos os critérios são verdadeiros
    const isFormValid = Object.values(validationCriteria).every(Boolean);

    if (!isFormValid) {
      setApiMessage({ type: 'error', text: 'Por favor, preencha a senha corretamente.' });
      return;
    }

    setIsLoading(true);
    setApiMessage({ type: '', text: '' }); // Limpa mensagens anteriores

    try {
      // Obtenção de dados do localStorage
      // --- CORREÇÃO APLICADA AQUI ---
      const email = localStorage.getItem('email'); // Corrigido de 'userEmail' para 'email'
      const tipo = localStorage.getItem('userType');

      if (!email || !tipo) {
        throw new Error("Dados de recuperação não encontrados. Por favor, inicie o processo novamente.");
      }

      const payload = {
        senha: password,
        email: email,
        tipo: tipo
      };

      // Envio da requisição para a API
      await axios.put('http://localhost:8080/v1/mesa-plus/nova-senha/', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Feedback de Sucesso e Redirecionamento
      setApiMessage({ type: 'success', text: 'Nova Senha Criada com sucesso!' });

      setTimeout(() => {
        navigate('/login');
      }, 2500); // 2,5 segundos

    } catch (error) {
      let userMessage = 'Ocorreu um erro ao atualizar a senha. Por favor, tente novamente.';

      // Se a API retornou uma mensagem de erro específica, use-a.
      if (error.response && error.response.data && error.response.data.message) {
        // Exemplo: se o erro for seguro de exibir, como "Token expirado"
        if (error.response.status === 401) {
          userMessage = 'Seu link de recuperação expirou. Por favor, solicite um novo.';
        }
      }

      // Para o desenvolvedor, sempre logue o erro completo no console
      console.error('API Error:', error.response || error.message);

      setApiMessage({ type: 'error', text: userMessage });
    }
  };

  return (
    <>
      <Navbar />

      <div
        className="imagemFundoRss"
        style={{ backgroundImage: `url(${backimage})` }}
        aria-hidden="true"
      />

      <main className="container-RecuperarNovaSenha">
        <div className="menuNs-top">
          <p className="mesaNs">Mesa+</p>
          <p className="recuperarNs">Recuperação Senha</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* NOVA SENHA */}
          <label>
            <img className="imagemCadeado" src={lockIcon} alt="cadeado" aria-hidden="true" />
            <input
              type={showNova ? "text" : "password"}
              name="novaSenha"
              aria-label="Nova Senha"
              autoComplete="new-password"
              placeholder="Nova Senha:"
              maxLength={14}
              minLength={10}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <label>
            <img className="imagemCheck" src={check} alt="Check" aria-hidden="true" />
            <input
              type={showConf ? "text" : "password"}
              name="confirmarSenha"
              aria-label="Confirmar Senha"
              autoComplete="new-password"
              placeholder="Confirmar Senha:"
              maxLength={14}
              minLength={10}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Renderização da validação em tempo real */}
          {password && <PasswordCriteria criteria={validationCriteria} />}

          {/* Renderização das mensagens da API */}
          {apiMessage.text && (
            <div className={`api-message ${apiMessage.type}`}>
              {apiMessage.text}
            </div>
          )}

          <button
            className="btnRecuperarNovaSenha btn--submitRecuperarNovaSenha"
            type="submit"
            disabled={isLoading || !Object.values(validationCriteria).every(Boolean)} // Melhoria na UI/UX
          >
            {isLoading ? 'Salvando...' : 'Recuperar Senha'}
          </button>
        </form>
      </main>
    </>
  );
}

export default RecuperarNovaSenha;