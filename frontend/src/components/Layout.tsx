import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  ['/dashboard', 'Dashboard'], ['/graduados', 'Graduados'], ['/titulaciones', 'Titulaciones'],
  ['/procesos', 'Procesos'], ['/titulos', 'Títulos físicos'], ['/impresion', 'Impresión'],
  ['/setec', 'SETEC'], ['/entrega', 'Entrega'], ['/reportes', 'Reportes'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <header>
        <strong>SIGTU</strong>
        <nav>{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
        <span className="who">{user?.name} ({user?.role}) <button onClick={logout}>Salir</button></span>
      </header>
      <main><Outlet /></main>
    </div>
  );
}