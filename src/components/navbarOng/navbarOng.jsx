
import { Link, useLocation } from 'react-router-dom';
import './navbarOng.css';

function NavbarOng() {
  const { pathname } = useLocation();

  // Itens do menu (ajuste os caminhos conforme suas rotas quando criar as páginas)
  const links = [
    { label: 'Home', to: '/homeOng' },         // por ora aponta para a mesma página inicial
    { label: 'Meu Perfil', to: '/meuPerfilOng' },
    { label: 'Meus Pedidos', to: '/meusAlimentosOng' },
    { label: 'Favoritos', to: '/favoritosOng' }
    
  ];

  // Garante que apenas a primeira ocorrência do caminho fique ativa (caso existam duas com o mesmo "to")
  const firstIndexForPath = links.findIndex(it => it.to === pathname);

  return (
    <nav className="navOng" aria-label="Navegação principal">
      <div className="nav__wrapOng">
        <ul className="navOng__menu" role="menubar">
          {links.map((item, idx) => {
            const isActive = idx === firstIndexForPath && pathname === item.to;
            return (
              <li key={item.label} className="navOng__item" role="none">
                <Link
                  role="menuitem"
                  to={item.to}
                  className={`navOng__link${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default NavbarOng;
