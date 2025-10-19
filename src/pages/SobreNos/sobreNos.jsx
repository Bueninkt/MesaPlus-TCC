import { useEffect } from 'react';
import './sobreNos.css';
import logo from "../../assets/icons/mesaLogo.png";
import navbar from '../../components/navbar/navbar';
import backimage from "../../assets/icons/backimage.png";



const Navbar = navbar;

function SobreNosPage() {

  return (
    <>
      <Navbar />

      <div className="sobrenos-bg" style={{ backgroundImage: `url(${backimage})` }} aria-hidden="true"></div>
    
      <main className="sobre">


        {/* HERO */}
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

            <aside className="about__right" aria-label="Identidade Mesa+">
              <img className="about__logo" src={logo} alt="Logotipo Mesa+ com ícones de alimento" />
            </aside>
          </div>
        </section>
      </main>


      <footer className='rodape'>
        <p>&copy; 2025 Todos os Direitos reservados</p>
      </footer>

    </>
  );
}

export default SobreNosPage;
