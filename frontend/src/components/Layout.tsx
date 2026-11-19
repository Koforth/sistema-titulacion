import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  ['/dashboard', 'Dashboard'],
  ['/graduados', 'Graduados y Títulos'],
  ['/procesos', 'Procesos'],
  ['/titulos', 'Títulos físicos'],
  ['/impresion', 'Impresión'],
  ['/setec', 'SETEC'],
  ['/entrega', 'Entrega'],
  ['/reportes', 'Reportes'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="shell">
      {/* ISO 9241-11: Accesibilidad por teclado */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header role="banner" className="site-header">
        <div className="header-top">
          <strong className="header-brand">SIGTU</strong>

          {/* Botón hamburguesa accesible para móvil */}
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
          >
            {menuOpen ? (
              <span className="icon-close" aria-hidden="true">✕</span>
            ) : (
              <span className="icon-hamburger" aria-hidden="true">☰</span>
            )}
          </button>
        </div>

        {/* Menú colapsable en móvil, horizontal en desktop */}
        <nav
          className={`nav-menu ${menuOpen ? 'open' : ''}`}
          aria-label="Navegación principal"
        >
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}

          <div className="who-mobile" aria-label="Información de sesión">
            <div className="user-badge">
              <strong>{user?.name}</strong>
              <small>({user?.role})</small>
            </div>
            <button
              type="button"
              className="logout-btn"
              onClick={logout}
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>

        {/* Info usuario visible en escritorio */}
        <div className="who-desktop" aria-label="Información de sesión">
          <span>{user?.name} <em>({user?.role})</em></span>
          <button type="button" className="logout-btn" onClick={logout} aria-label="Cerrar sesión actual">
            Salir
          </button>
        </div>
      </header>

      {/* Overlay para cerrar al tocar fuera en móvil */}
      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />}

      <main id="main-content" role="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
