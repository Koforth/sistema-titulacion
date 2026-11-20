import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Alert, Badge, Loading, fecha } from '../components/ui';
import type { TituloFisico } from '../api/types';
import GuiaRemisionModal from '../components/GuiaRemisionModal';

export default function TituloDetalle() {
  const { id } = useParams();
  const { data: t, error, loading } = useApi<TituloFisico>(`/titulos-fisicos/${id}`);
  const [isActaOpen, setIsActaOpen] = useState(false);

  if (loading) return <Loading />;
  if (error || !t) return <Alert>{error ?? 'Título no encontrado'}</Alert>;

  return (
    <section>
      <div className="toolbar" style={{ marginBottom: '1.2rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            <Link to="/titulos" style={{ textDecoration: 'none' }}>← Volver a Títulos Físicos</Link>
          </div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            📜 Título N.º {t.numero_titulo}
            <Badge value={t.ubicacion_actual} />
          </h1>
        </div>

        <button
          type="button"
          className="btn-search"
          style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.84rem' }}
          onClick={() => setIsActaOpen(true)}
        >
          📄 Ver Hoja de Custodia Oficial
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.95rem', color: 'var(--primary)' }}>
            🎓 Datos del Graduado y Titulación
          </h3>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Graduado:</strong> {t.titulacion?.graduado?.nombre_completo || '—'}
          </p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Cédula / Carnet:</strong> {t.titulacion?.graduado?.cedula || t.titulacion?.graduado?.carnet || '—'}
          </p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Carrera:</strong> {t.titulacion?.carrera || '—'}
          </p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Título Obtenido:</strong> {t.titulacion?.titulo_obtenido || '—'}
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.95rem', color: 'var(--gold-text)' }}>
            📖 Registro y Trazabilidad Física
          </h3>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Libro / Tomo / Folio:</strong> {[t.libro, t.tomo, t.folio].filter(Boolean).join(' / ') || '—'}
          </p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Ubicación Actual:</strong> <Badge value={t.ubicacion_actual} />
          </p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>UUID Verificación:</strong> <code style={{ fontSize: '0.78rem', background: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>{t.uuid}</code>
          </p>
          <p style={{ margin: '0.2rem 0', fontSize: '0.88rem' }}>
            <strong>Observaciones:</strong> {t.observaciones || 'Sin observaciones'}
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.2rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#111' }}>
          ⏱️ Línea de Tiempo de Custodia y Movimientos (En Tiempo Real)
        </h2>

        {!t.historial || t.historial.length === 0 ? (
          <p className="muted">No hay eventos de custodia registrados para este título.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '0.5rem' }}>
            {t.historial.map((h, idx) => (
              <div
                key={h.id || idx}
                style={{
                  display: 'flex',
                  gap: '0.9rem',
                  alignItems: 'flex-start',
                  position: 'relative',
                  paddingBottom: idx === t.historial!.length - 1 ? 0 : '0.8rem',
                  borderLeft: idx === t.historial!.length - 1 ? 'none' : '2px solid var(--primary-border)',
                  marginLeft: '6px',
                  paddingLeft: '14px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 2px var(--gold)',
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>
                    {h.tipo_evento || h.accion || 'Evento registrado'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#374151', margin: '2px 0' }}>
                    {h.descripcion || '—'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    📅 {fecha(h.fecha || h.created_at)} · {new Date(h.fecha || h.created_at).toLocaleTimeString('es-NI')}
                    {h.usuario && ` · 👤 Responsable: ${h.usuario.name}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Hoja de Custodia */}
      <GuiaRemisionModal
        isOpen={isActaOpen}
        onClose={() => setIsActaOpen(false)}
        tituloIndividual={t}
        tipoTrámite="ENTREGA_GRADUADO"
      />
    </section>
  );
}
