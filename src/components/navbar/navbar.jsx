// Navbar.js
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  // 1. Usamos 'pathname' e 'hash' para saber a URL completa
  const { pathname, hash } = useLocation();
  
  // Combina o caminho e a âncora: (ex: "/" ou "/#sobre-nos")
  const currentPath = pathname + (hash || ''); 

  // 2. MODIFICAÇÃO: Todos os links são âncoras na rota "/"
  const links = [
    { label: 'Sobre Nós', to: '/#sobre-nos' },
    { label: 'Problema', to: '/#problema' },
    { label: 'Próximos Passos', to: '/#proximos-passos' },
    { label: 'Benefícios', to: '/#beneficios' }
  ];

  // 3. Lógica de "ativo" (NÃO PRECISA MUDAR)
  // Esta lógica já funciona perfeitamente para âncoras
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

        {/* Os botões de Entrar/Cadastrar continuam indo para páginas diferentes */}
        <div className="nav__actions">
          <Link to="/login" className="btnNav btn--login">Entrar</Link>
          <Link to="/hudCadastros" className="btnNav btn--signup">Cadastrar-se</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;