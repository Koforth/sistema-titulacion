import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Graduados from './pages/Graduados';
import Procesos from './pages/Procesos';
import CustodiaTitulos from './pages/CustodiaTitulos';
import TituloDetalle from './pages/TituloDetalle';
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

          {/* Módulo Unificado de Custodia y Trazabilidad Física con retrocompatibilidad de rutas */}
          <Route path="/custodia" element={<CustodiaTitulos defaultTab="inventario" />} />
          <Route path="/titulos" element={<CustodiaTitulos defaultTab="inventario" />} />
          <Route path="/titulos/:id" element={<TituloDetalle />} />
          <Route path="/impresion" element={<CustodiaTitulos defaultTab="impresion" />} />
          <Route path="/setec" element={<CustodiaTitulos defaultTab="setec" />} />
          <Route path="/entrega" element={<CustodiaTitulos defaultTab="entrega" />} />

          <Route path="/reportes" element={<Reportes />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
