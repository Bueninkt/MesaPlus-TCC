
import { Link, useLocation } from 'react-router-dom';
import './navbarEmpresa.css';

function NavbarEmpresa() {
  const { pathname } = useLocation();

  // Itens do menu (ajuste os caminhos conforme suas rotas quando criar as páginas)
  const links = [
    { label: 'Home', to: '/home' },
    { label: 'Sobre Nós', to: '/' },             // por ora aponta para a mesma página inicial
    { label: 'Mapa', to: '/mapa' },
    { label: 'Meu Perfil', to: '/meu-perfil' },
    { label: 'Meus Alimentos', to: '/meus-alimentos'},
    { label: 'Cadastrar Alimentos', to: '/cadastrar-alimentos' },
  ];

  // Garante que apenas a primeira ocorrência do caminho fique ativa (caso existam duas com o mesmo "to")
  const firstIndexForPath = links.findIndex(it => it.to === pathname);

  return (
    <nav className="navEmpresa" aria-label="Navegação principal">
      <div className="nav__wrapEmpresa">
        <ul className="navEmpresa__menu" role="menubar">
          {links.map((item, idx) => {
            const isActive = idx === firstIndexForPath && pathname === item.to;
            return (
              <li key={item.label} className="navEmpresa__item" role="none">
                <Link
                  role="menuitem"
                  to={item.to}
                  className={`navEmpresa__link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="navEmpresa__actions">
          <Link to="/login" className="btnNavEmpresa btnEmpresa--login">Entrar</Link>
          <Link to="/hudCadastros" className="btnNavEmpresa
          btnEmpresa--signup">Cadastrar-se</Link>
        </div>
      </div>
    </nav>
  );
}

export default NavbarEmpresa;
