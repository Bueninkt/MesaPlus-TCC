
import { Link, useLocation } from 'react-router-dom';
import './navbarUsuario.css';

function NavbarUsuario() {
  const { pathname } = useLocation();

  // Itens do menu (ajuste os caminhos conforme suas rotas quando criar as páginas)
  const links = [
    { label: 'Home', to: '/homeUsuario' },         // por ora aponta para a mesma página inicial
    { label: 'Meu Perfil', to: '/meuPerfilUsuario' },
    { label: 'Meus Pedidos', to: '/meusAlimentosUsuario' },
    { label: 'Favoritos', to: '/favoritosUsuario' }
    
  ];

  // Garante que apenas a primeira ocorrência do caminho fique ativa (caso existam duas com o mesmo "to")
  const firstIndexForPath = links.findIndex(it => it.to === pathname);

  return (
    <nav className="navUsuario" aria-label="Navegação principal">
      <div className="nav__wrapUsuario">
        <ul className="navUsuario__menu" role="menubar">
          {links.map((item, idx) => {
            const isActive = idx === firstIndexForPath && pathname === item.to;
            return (
              <li key={item.label} className="navUsuario__item" role="none">
                <Link
                  role="menuitem"
                  to={item.to}
                  className={`navUsuario__link${isActive ? ' is-active' : ''}`}
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

export default NavbarUsuario;
