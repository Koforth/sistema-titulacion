import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  ['/dashboard', 'Dashboard'],
  ['/graduados', 'Graduados'],
  ['/titulaciones', 'Titulaciones'],
  ['/procesos', 'Procesos'],
  ['/titulos', 'Títulos físicos'],
  ['/impresion', 'Impresión'],
  ['/setec', 'SETEC'],
  ['/entrega', 'Entrega'],
  ['/reportes', 'Reportes'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      {/* ISO 9241-11: Accesibilidad por teclado */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <header role="banner">
        <strong>SIGTU</strong>
        <nav aria-label="Navegación principal">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="who" aria-label="Información de sesión">
          <span>{user?.name} <em>({user?.role})</em></span>
          <button type="button" onClick={logout} aria-label="Cerrar sesión actual">
            Salir
          </button>
        </div>
      </header>
      <main id="main-content" role="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
