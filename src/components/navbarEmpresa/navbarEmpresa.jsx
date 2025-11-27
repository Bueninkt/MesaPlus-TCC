
import { Link, useLocation } from 'react-router-dom';
import './navbarEmpresa.css';

function NavbarEmpresa() {
  const { pathname } = useLocation();

  const links = [      
    { label: 'Meu Perfil', to: '/meuPerfilEmpresa' },
    { label: 'Cadastrar Alimentos', to: '/cadastrarAlimentosEmpresa' },
  ];

  
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
