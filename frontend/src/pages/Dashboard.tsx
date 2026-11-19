import { Link } from 'react-router-dom';
import type { Dashboard as D } from '../api/types';
import { useApi } from '../hooks/useApi';
import { Alert, Badge, Loading } from '../components/ui';

const labels: Record<keyof D['counts'], string> = {
  en_proceso: 'En proceso', en_imprenta: 'En imprenta', en_setec: 'En SETEC',
  en_leon: 'En León', entregados: 'Entregados', sla_vencido: 'SLA vencido (+45 días)',
};

export default function Dashboard() {
  const { data, error, loading } = useApi<D>('/dashboard');
  if (loading) return <Loading />;
  if (error || !data) return <Alert>{error ?? 'Sin datos'}</Alert>;
  return (
    <section>
      <h1>Dashboard</h1>
      <div className="stats">
        {(Object.keys(labels) as (keyof D['counts'])[]).map((k) => (
          <div key={k} className={`stat ${k === 'sla_vencido' && data.counts[k] > 0 ? 'danger' : ''}`}>
            <b>{data.counts[k]}</b><span>{labels[k]}</span>
          </div>
        ))}
      </div>
      <h2>Últimos títulos</h2>
      <table>
        <thead><tr><th>N.º</th><th>Graduado</th><th>Ubicación</th></tr></thead>
        <tbody>
          {data.ultimos_titulos.map((t) => (
            <tr key={t.id}>
              <td><Link to={`/titulos/${t.id}`}>{t.numero_titulo}</Link></td>
              <td>{t.titulacion?.graduado?.nombre_completo}</td>
              <td><Badge value={t.ubicacion_actual} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}