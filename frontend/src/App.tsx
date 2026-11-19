import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Graduados from './pages/Graduados';
import Procesos from './pages/Procesos';
import Titulos from './pages/Titulos';
import TituloDetalle from './pages/TituloDetalle';
import Impresion from './pages/Impresion';
import Setec from './pages/Setec';
import Entrega from './pages/Entrega';
import Reportes from './pages/Reportes';
import { ConsultaHome, Verificar } from './pages/ConsultaPublica';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ConsultaHome />} />
      <Route path="/verificar/:uuid" element={<Verificar />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/graduados" element={<Graduados />} />
          <Route path="/titulaciones" element={<Navigate to="/graduados" replace />} />
          <Route path="/procesos" element={<Procesos />} />
          <Route path="/titulos" element={<Titulos />} />
          <Route path="/titulos/:id" element={<TituloDetalle />} />
          <Route path="/impresion" element={<Impresion />} />
          <Route path="/setec" element={<Setec />} />
          <Route path="/entrega" element={<Entrega />} />
          <Route path="/reportes" element={<Reportes />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
