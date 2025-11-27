
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const { pathname, hash } = useLocation();
  const currentPath = pathname + (hash || ''); 

  const links = [
    { label: 'Sobre Nós', to: '/#sobre-nos' },
    { label: 'Problema', to: '/#problema' },
    { label: 'Próximos Passos', to: '/#proximos-passos' },
    { label: 'Benefícios', to: '/#beneficios' }
  ];

  const activeIndex = links.findIndex(it => it.to === currentPath);

  return (
    <nav className="nav" aria-label="Navegação principal">
      <div className="nav__wrap">
        <ul className="nav__menu" role="menubar">
          {links.map((item, idx) => {
            const isActive = idx === activeIndex;
            
            return (
              <li key={item.label} className="nav__item" role="none">
                <Link
                  role="menuitem"
                  to={item.to}
                  className={`nav__link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

       
        <div className="nav__actions">
          <Link to="/login" className="btnNav btn--login">Entrar</Link>
          <Link to="/hudCadastros" className="btnNav btn--signup">Cadastrar-se</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;