import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  const { pathname } = useLocation();

  // Itens do menu (ajuste os caminhos conforme suas rotas quando criar as páginas)
  const links = [
    { label: 'Home', to: '/home' },
    { label: 'Sobre Nós', to: '/' },             // por ora aponta para a mesma página inicial
    { label: 'Mapa', to: '/mapa' },
    { label: 'Meu Perfil', to: '/meu-perfil' },
    { label: 'Meus Pedidos', to: '/meus-pedidos' },
    { label: 'Favoritos', to: '/favoritos' },
    { label: 'Cadastrar Alimentos', to: '/cadastrar-alimentos' },
  ];

  // Garante que apenas a primeira ocorrência do caminho fique ativa (caso existam duas com o mesmo "to")
  const firstIndexForPath = links.findIndex(it => it.to === pathname);

  return (
    <nav className="nav" aria-label="Navegação principal">
      <div className="nav__wrap">
        <ul className="nav__menu" role="menubar">
          {links.map((item, idx) => {
            const isActive = idx === firstIndexForPath && pathname === item.to;
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
          <Link to="/login" className="btn btn--login">Entrar</Link>
          <Link to="/hudCadastros" className="btn btn--signup">Cadastrar-se</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
