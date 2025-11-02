
import { Link, useLocation } from 'react-router-dom';
import './navbarEmpresa.css';

function NavbarEmpresa() {
  const { pathname } = useLocation();

  // Itens do menu (ajuste os caminhos conforme suas rotas quando criar as páginas)
  const links = [
    { label: 'Home', to: '/homeEmpresa' },         // por ora aponta para a mesma página inicial
    { label: 'Meu Perfil', to: '/meuPerfilEmpresa' },
    { label: 'Meus Alimentos', to: '/meusAlimentosEmpresa' },
    { label: 'Cadastrar Alimentos', to: '/cadastrarAlimentosEmpresa' },
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
      </div>
    </nav>
  );
}

export default NavbarEmpresa;
