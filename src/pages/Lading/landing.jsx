import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './landing.css';
import logo from "../../assets/icons/mesaLogo.png";
import navbar from '../../components/navbar/navbar';
import user from "../../assets/icons/user.png";
import backimage from "../../assets/icons/backimage.png";
import bag from "../../assets/icons/bag.png";
import houseEat from "../../assets/icons/houseEat.png";
import lixo from "../../assets/icons/lixo.png";
import ia from "../../assets/icons/ia.png"; 
import globo from "../../assets/icons/globo.png";

const Navbar = navbar;

function LandingPage() {
  const location = useLocation();

  // Este código já está correto e vai funcionar para todos os links.
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <div className="sobrenos-bg" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true"></div>

      {/* Seção "Sobre Nós" (para o link "/#sobre-nos") */}
      <section id="sobre-nos" className="about" aria-labelledby="about-title">
        <main className="sobre">
          <section className="hero" aria-labelledby="hero-title">
            <div className="container">
              <h1 id="hero-title" className="brand-title">Mesa+</h1>
              <p className="brand-subtitle">Combatendo o Desperdício e a Fome!</p>
            </div>
          </section>

          {/* FAIXA DIVISÓRIA (como no print) */}
          <div className="faixa" aria-hidden="true" />

          {/* SOBRE NÓS */}
          <section id="sobre-nos" className="about" aria-labelledby="about-title">
            <div className="container about__grid">
              <div className="about__left">
                <h2 id="about-title" className="about__heading">SOBRE NÓS:</h2>
                <p className="about__text">
                  <em>
                    Somos um projeto que conecta estabelecimentos, pessoas e instituições de caridade
                    com o intuito de disponibilizar alimento para você, combatendo o desperdício e a fome!
                  </em>
                </p>
              </div>

            
                <img className="about__logo" src={logo} alt="Logotipo Mesa+ com ícones de alimento" />
             
            </div>
          </section>
        </main>
      </section>

      {/* ========================================================= */}
      {/* 🚨 SEÇÕES CORRIGIDAS ABAIXO 🚨 */}
      {/* ========================================================= */}

      {/* Seção De Problema */}
      {/* 👇 CLASSE CORRIGIDA 👇 */}
      <section id="problema" className="problema">
        <div className="container">

      

          <div className="problema__grid">

            {/* Card Desperdício */}
            <article className="problema-card" aria-labelledby="problema-desperdicio-title">
              
              {/* --- NOVO: Ícone Sobreposto --- */}
              <div className="problema-card__visual">
                <img
                  src={lixo}
                  alt="Ícone de sacola de compras"
                  className="problema-card__icon"
                />
              </div>

              {/* --- NOVO: Wrapper de Conteúdo --- */}
              <div className="problema-card__content">
                
                {/* --- NOVO: Tag de Destaque --- */}
                <span className="problema-card__tag">O Desperdício</span>
                
                {/* --- NOVO: Título de Impacto --- */}
                <h3 id="problema-desperdicio-title" className="problema-card__title">
                  Alimentos Perfeitamente Bons
                </h3>
                
                <p className="problema-card__text">
                  Toneladas de alimentos em perfeitas condições são descartados diariamente por estabelecimentos comerciais, gerando prejuízo ambiental e financeiro.
                </p>
              </div>

            </article>

            {/* Card Fome */}
            <article className="problema-card" aria-labelledby="problema-fome-title">

              {/* --- NOVO: Ícone Sobreposto --- */}
              <div className="problema-card__visual">
                <img
                  src={houseEat}
                  alt="Ícone de casa com garfo e faca"
                  className="problema-card__icon"
                />
              </div>

              {/* --- NOVO: Wrapper de Conteúdo --- */}
              <div className="problema-card__content">

                {/* --- NOVO: Tag de Destaque --- */}
                <span className="problema-card__tag">A Fome</span>

                {/* --- NOVO: Título de Impacto --- */}
                <h3 id="problema-fome-title" className="problema-card__title">
                  Insegurança Alimentar
                </h3>

                <p className="problema-card__text">
                  Ao mesmo tempo, milhões de pessoas e ONGs lutam para conseguir alimentos, vivendo em situação de insegurança alimentar e vulnerabilidade.
                </p>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* Seção "Proximos Passos" (para o link "/#proximos-passos") */}
      {/* 👇 CLASSE CORRIGIDA 👇 */}
      <section id="proximos-passos" className="proximos-passos">
        <div className="container">

          {/* --- Título da Seção --- */}
          <h2 id="passos-title" className="passos__heading">Nossa Visão de Futuro</h2>
          <p className="passos__subheading">
            Estamos apenas começando. Nossa visão é clara e nossos próximos passos 
            redefinirão o combate ao desperdício.
          </p>

          {/* --- NOVO: A Timeline de Ascensão --- */}
          <div className="passos__timeline">

            {/* Etapa 01: Alcance e Parcerias */}
            <article className="passo-item" aria-labelledby="passo-alcance-title">
              <div className="passo-item__number-wrapper">
                <span className="passo-item__number">01</span>
              </div>
              <div className="passo-item__content">
                <img src={user} alt="Ícone de parcerias" className="passo-item__icon" />
                <div className="passo-item__text">
                  <h3 id="passo-alcance-title" className="passo-item__title">Ampliar Parcerias</h3>
                  <p className="passo-item__description">
                    Expandir o MesaPlus para novos ambientes como escolas, feiras e 
                    programas de culinária para criar uma rede de impacto massiva.
                  </p>
                </div>
              </div>
            </article>

            {/* Etapa 02: Inovação com IA */}
            <article className="passo-item" aria-labelledby="passo-ia-title">
              <div className="passo-item__number-wrapper">
                <span className="passo-item__number">02</span>
              </div>
              <div className="passo-item__content">
                <img src={ia} alt="Ícone de IA e Visão Computacional" className="passo-item__icon" />
                <div className="passo-item__text">
                  <h3 id="passo-ia-title" className="passo-item__title">Adicionar IOT</h3>
                  <p className="passo-item__description">
                    Implementar IA para reconhecer validades via câmera, 
                    notificando usuários sobre vencimentos e otimizando a logística de doação.
                  </p>
                </div>
              </div>
            </article>

            {/* Etapa 03: Impacto Global */}
            <article className="passo-item" aria-labelledby="passo-global-title">
              <div className="passo-item__number-wrapper">
                <span className="passo-item__number">03</span>
              </div>
              <div className="passo-item__content">
                <img src={globo} alt="Globo" className="passo-item__icon passo-item__icon--globo" />
                <div className="passo-item__text">
                  <h3 id="passo-global-title" className="passo-item__title">Impacto Global</h3>
                  <p className="passo-item__description">
                    Expandir para novos estados e países, tornando o MesaPlus uma 
                    ferramenta reconhecida no combate à insegurança alimentar global.
                  </p>
                </div>
              </div>
            </article>

          </div> {/* Fim .passos__timeline */}
        </div>
        
      </section>

      {/* Seção "Beneficios" (para o link "/#beneficios") */} 
      {/* 👇 CLASSE CORRIGIDA 👇 */}
      <section id="beneficios" className="beneficios">
        <div className="container">
        
        <h2 id="beneficios-title" className="beneficios__heading">
          VANTAGENS PARA TODOS
        </h2>
        
        <div className="beneficios__grid">
          
          {/* Card 1: Empresas */}
          <article className="beneficio-card" aria-labelledby="beneficio-empresas-title">
            <img src={bag} alt="" className="beneficio-card__icon" />
            <h3 id="beneficio-empresas-title" className="beneficio-card__title">
              PARA EMPRESAS
            </h3>
            <p className="beneficio-card__text">
              Reduza o desperdício, fortaleça sua marca com responsabilidade social e gerencie doações facilmente.
            </p>
          </article>

          {/* Card 2: ONGs */}
          <article className="beneficio-card" aria-labelledby="beneficio-ongs-title">
            <img src={houseEat} alt="" className="beneficio-card__icon" />
            <h3 id="beneficio-ongs-title" className="beneficio-card__title">
              PARA ONGS
            </h3>
            <p className="beneficio-card__text">
              Encontre doações de forma centralizada, otimize sua logística e ajude mais pessoas com menos esforço.
            </p>
          </article>
          
          {/* Card 3: Pessoas */}
          <article className="beneficio-card" aria-labelledby="beneficio-pessoas-title">
            <img src={user} alt="" className="beneficio-card__icon" />
            <h3 id="beneficio-pessoas-title" className="beneficio-card__title">
              PARA PESSOAS
            </h3>
            <p className="beneficio-card__text">
              Acesse alimentos de qualidade gratuitamente, encontre pontos de coleta próximos e garanta sua refeição.
            </p>
          </article>

        </div>
      </div>
      </section>

      <footer className='rodape'>
        <p>&copy; 2025 Todos os Direitos reservados</p>
      </footer>
    </>
  );
}

export default LandingPage;