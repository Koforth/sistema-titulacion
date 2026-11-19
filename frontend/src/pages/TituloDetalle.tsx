import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Alert, Badge, Loading, fecha } from '../components/ui';
import type { TituloFisico } from '../api/types';

export default function TituloDetalle() {
  const { id } = useParams();
  const { data: t, error, loading } = useApi<TituloFisico>(`/titulos-fisicos/${id}`);
  if (loading) return <Loading />;
  if (error || !t) return <Alert>{error ?? 'No encontrado'}</Alert>;
  return (
    <section>
      <h1>Título {t.numero_titulo} <Badge value={t.ubicacion_actual} /></h1>
      <p><b>Graduado:</b> {t.titulacion?.graduado?.nombre_completo} · <b>Carrera:</b> {t.titulacion?.carrera}</p>
      <p><b>Libro/Tomo/Folio:</b> {[t.libro, t.tomo, t.folio].filter(Boolean).join(' / ') || '—'}</p>
      <h2>Historial</h2>
      <ul className="timeline">
        {t.historial?.map((h) => (
          <li key={h.id}><b>{h.accion}</b> — {h.descripcion} <span className="muted">({fecha(h.created_at)}{h.usuario ? `, ${h.usuario.name}` : ''})</span></li>
        ))}
      </ul>
    </section>
  );
}