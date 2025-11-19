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

    const isFormValid = Object.values(validationCriteria).every(Boolean);

    if (!isFormValid) {
      setApiMessage({ type: 'error', text: 'Por favor, preencha a senha corretamente seguindo os critérios.' });
      return;
    }

    setIsLoading(true);
    setApiMessage({ type: '', text: '' });

    try {
      // --- CORREÇÃO ROBUSTA DO LOCALSTORAGE ---
      
      // 1. Tenta obter o objeto 'user' completo (padrão do sistema)
      const userStorage = localStorage.getItem('user');
      const userObj = userStorage ? JSON.parse(userStorage) : null;

      // 2. Define Email: Tenta no objeto user, senão tenta buscar item solto
      const email = userObj?.email || localStorage.getItem('email');

      // 3. Define ID (Opcional, mas seu controller aceita):
      const id = userObj?.id || localStorage.getItem('id');

      // 4. Define Tipo: Verifica chaves comuns (tipo, type, userType)
      // Nota: Se seu JSON de login usa outro nome para o tipo, ajuste aqui.
      const tipo = userObj?.tipo || userObj?.userType || localStorage.getItem('userType');

      // Validação de segurança antes de enviar
      if ((!email && !id) || !tipo) {
        // Se não temos nem email nem ID, ou faltou o tipo, não dá para prosseguir
        console.error("Dados de sessão faltantes:", { email, id, tipo, userObj });
        throw new Error("Sessão inválida. Por favor, faça login novamente.");
      }

      // Monta o payload
      // O controller aceita 'id' OU 'email'. Mandar o ID é geralmente mais seguro se disponível.
      const payload = {
        senha: password,
        tipo: tipo, // 'empresa', 'cliente', etc.
        email: email, // Opcional se tiver ID, mas bom manter
        id: id        // Opcional se tiver email, mas garante integridade
      };

      console.log("Enviando payload:", { ...payload, senha: "***" }); // Debug seguro

      await axios.put('http://localhost:8080/v1/mesa-plus/nova-senha/', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setApiMessage({ type: 'success', text: 'Nova Senha Criada com sucesso!' });

      setTimeout(() => {
        // Se o usuário veio da página de perfil, talvez queira voltar pra lá
        // Mas como alterou a senha, login é o mais seguro.
        navigate('/login');
      }, 2500);

    } catch (error) {
      let userMessage = 'Ocorreu um erro ao atualizar a senha.';

      if (error.response) {
        // Erros vindos do Backend
        if (error.response.data && error.response.data.message) {
             userMessage = error.response.data.message;
        } else if (error.response.status === 404) {
             userMessage = 'Usuário não encontrado.';
        } else if (error.response.status === 400) {
             userMessage = 'Dados inválidos enviados.';
        }
      } else if (error.message) {
        // Erros lançados manualmente (ex: Sessão inválida)
        userMessage = error.message;
      }

      console.error('Erro ao atualizar:', error);
      setApiMessage({ type: 'error', text: userMessage });
    } finally {
        setIsLoading(false);
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

          <PasswordCriteria criteria={validationCriteria} />

          {apiMessage.text && (
            <div className={`api-message ${apiMessage.type}`}>
              {apiMessage.text}
            </div>
          )}

          <button
            className="btnRecuperarNovaSenha btn--submitRecuperarNovaSenha"
            type="submit"
            disabled={isLoading || !Object.values(validationCriteria).every(Boolean)}
          >
            {isLoading ? 'Salvando...' : 'Recuperar Senha'}
          </button>
        </form>
      </main>
    </>
  );
}

export default RecuperarNovaSenha;  