import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Alert, Badge, Loading } from '../components/ui';
import type { Proceso, TituloFisico } from '../api/types';

interface R { tipo: string; tipos: Record<string, string>; titulos?: TituloFisico[]; procesos?: Proceso[] }

export default function Reportes() {
  const [tipo, setTipo] = useState('en_leon');
  const { data, error, loading } = useApi<R>(`/reportes?tipo=${tipo}`);
  return (
    <section>
      <h1>Reportes</h1>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        {Object.entries(data?.tipos ?? { [tipo]: tipo }).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {error && <Alert>{error}</Alert>}
      {loading && <Loading />}
      {data?.titulos && (
        <table>
          <thead><tr><th>N.º</th><th>Graduado</th><th>Ubicación</th></tr></thead>
          <tbody>{data.titulos.map((t) => (
            <tr key={t.id}><td>{t.numero_titulo}</td><td>{t.titulacion?.graduado?.nombre_completo}</td><td><Badge value={t.ubicacion_actual} /></td></tr>
          ))}</tbody>
        </table>
      )}
      {data?.procesos && (
        <table>
          <thead><tr><th>Graduado</th><th>Carrera</th></tr></thead>
          <tbody>{data.procesos.map((p) => (
            <tr key={p.id}><td>{p.titulacion?.graduado?.nombre_completo}</td><td>{p.titulacion?.carrera}</td></tr>
          ))}</tbody>
        </table>
      )}
    </section>
  );
}