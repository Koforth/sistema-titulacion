import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, type Page } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, Loading, Pager, fecha } from '../components/ui';
import type { Proceso, ProcesoStats } from '../api/types';

interface EtapaDef {
  key: string;
  label: string;
  requeridoParaSla?: boolean;
  isDanger?: boolean;
}

interface FaseWorkflow {
  nombre: string;
  descripcion: string;
  etapas: EtapaDef[];
}

// Definición agrupada de las etapas del workflow universitario
const FASES_WORKFLOW: FaseWorkflow[] = [
  {
    nombre: 'Fase 1 · Solicitud y Conformación de Expediente',
    descripcion: 'Al completar ambos requisitos se activa el cómputo oficial del SLA de 45 días.',
    etapas: [
      { key: 'solicitado_estudiante', label: '1. Solicitado por el estudiante', requeridoParaSla: true },
      { key: 'expediente_completo', label: '2. Expediente completo en titulación', requeridoParaSla: true },
    ],
  },
  {
    nombre: 'Fase 2 · Elaboración Técnica y Gaceta',
    descripcion: 'Preparación de datos, caligrafiado y registro legal oficial.',
    etapas: [
      { key: 'elaboracion_bd', label: '3. Elaboración de base de datos' },
      { key: 'elaboracion_titulo', label: '4. Elaboración del cartón del título físico' },
      { key: 'doc_certificacion', label: '5. Elaboración de oficio para certificación SETEC' },
      { key: 'en_gaceta', label: '6. Publicación en La Gaceta, Diario Oficial' },
    ],
  },
  {
    nombre: 'Fase 3 · Auditoría y Control de Calidad',
    descripcion: 'Revisión institucional por secretaría general.',
    etapas: [
      { key: 'en_revision', label: '7. En revisión técnica' },
      { key: 'revisado', label: '8. Revisado con visto bueno' },
      { key: 'validado', label: '9. Validado por Secretaría Académica' },
    ],
  },
  {
    nombre: 'Fase 4 · Entrega y Cierre',
    descripcion: 'Recepción formal por el graduado y cierre del expediente.',
    etapas: [
      { key: 'titulo_entregado_graduado', label: '10. Título entregado al graduado (Cierra expediente)' },
      { key: 'entregado_estudiante', label: '11. Constancia firmada en archivo' },
    ],
  },
  {
    nombre: 'Incidencias y Excepciones',
    descripcion: 'Registros para control de riesgos y auditoría documental.',
    etapas: [
      { key: 'titulo_rechazado', label: 'Título rechazado por observaciones', isDanger: true },
      { key: 'titulo_anulado', label: 'Título anulado / cancelado', isDanger: true },
      { key: 'otro', label: 'Otro trámite extraordinario' },
    ],
  },
];

export default function Procesos() {
  const { can } = useAuth();
  const [procesos, setProcesos] = useState<Page<Proceso> | null>(null);
  const [stats, setStats] = useState<ProcesoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal de gestión de etapas
  const [activeProceso, setActiveProceso] = useState<Proceso | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingEtapa, setUpdatingEtapa] = useState<string | null>(null);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  const cargarStats = async () => {
    try {
      const data = await api<ProcesoStats>('/procesos-titulo/stats');
      setStats(data);
    } catch (err: unknown) {
      console.warn('Error al cargar estadísticas de procesos:', err);
    }
  };

  const cargarProcesos = async (page = 1, estado = filtroEstado, q = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (estado && estado !== 'todos') params.append('estado', estado);
      if (q.trim()) params.append('q', q.trim());

      const data = await api<Page<Proceso>>(`/procesos-titulo?${params.toString()}`);
      setProcesos(data);
      setCurrentPage(data.current_page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los procesos de titulación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarStats();
    cargarProcesos(1, filtroEstado, searchQuery);
  }, [filtroEstado]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarProcesos(1, filtroEstado, searchQuery);
  };

  const handleOpenProceso = (p: Proceso) => {
    setActiveProceso(p);
    setModalFeedback(null);
    setIsModalOpen(true);
  };

  // Alternar valor de una etapa booleana
  const handleToggleEtapa = async (etapaKey: string, valorActual: boolean) => {
    if (!activeProceso) return;
    setUpdatingEtapa(etapaKey);
    setModalFeedback(null);

    try {
      const actualizado = await api<Proceso>(`/procesos-titulo/${activeProceso.id}/marcar-etapa`, {
        method: 'POST',
        body: {
          etapa: etapaKey,
          valor: !valorActual,
        },
      });

      setActiveProceso(actualizado);
      setModalFeedback(`✓ Etapa actualizada correctamente.`);

      // Actualizar en la lista general en memoria
      if (procesos) {
        const nuevos = procesos.data.map((p) => (p.id === actualizado.id ? { ...p, ...actualizado } : p));
        setProcesos({ ...procesos, data: nuevos });
      }
      cargarStats();
    } catch (err: unknown) {
      setModalFeedback(`⚠️ ${err instanceof Error ? err.message : 'Error al actualizar etapa'}`);
    } finally {
      setUpdatingEtapa(null);
    }
  };

  // Calcular conteo y porcentaje de avance
  const calcularProgreso = (p: Proceso) => {
    const etapasBase = [
      'solicitado_estudiante',
      'expediente_completo',
      'elaboracion_bd',
      'elaboracion_titulo',
      'doc_certificacion',
      'en_gaceta',
      'en_revision',
      'revisado',
      'validado',
      'titulo_entregado_graduado',
    ];

    let completadas = 0;
    for (const key of etapasBase) {
      if ((p as unknown as Record<string, unknown>)[key]) completadas++;
    }

    const pct = Math.round((completadas / etapasBase.length) * 100);
    return { completadas, total: etapasBase.length, pct };
  };

  return (
    <section>
      <div className="toolbar" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            📋 Procesos de Titulación y SLA
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (Gestión de Etapas Administrativas y Plazo de 45 Días)
            </span>
          </h1>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen del SLA */}
      {stats && (
        <div className="kpis-grid" style={{ marginBottom: '1.2rem' }}>
          <div className="kpi-card" onClick={() => setFiltroEstado('todos')} style={{ cursor: 'pointer' }}>
            <div className="kpi-icon orange">📋</div>
            <div className="kpi-info">
              <span className="kpi-label">Total en Trámite</span>
              <span className="kpi-value">{stats.en_tramite}</span>
              <span className="kpi-subtext">{stats.total} expedientes históricos</span>
            </div>
          </div>

          <div className="kpi-card" onClick={() => setFiltroEstado('en_tiempo')} style={{ cursor: 'pointer' }}>
            <div className="kpi-icon green">⏱️</div>
            <div className="kpi-info">
              <span className="kpi-label">En Tiempo (SLA Normal)</span>
              <span className="kpi-value" style={{ color: 'var(--success)' }}>
                {Math.max(0, stats.en_tramite - stats.en_alerta - stats.vencidos)}
              </span>
              <span className="kpi-subtext">&gt; 10 días restantes</span>
            </div>
          </div>

          <div className="kpi-card" onClick={() => setFiltroEstado('proximo_vencer')} style={{ cursor: 'pointer' }}>
            <div className="kpi-icon" style={{ background: 'var(--gold-soft)', color: 'var(--gold-text)' }}>⚠️</div>
            <div className="kpi-info">
              <span className="kpi-label">En Alerta Preventiva</span>
              <span className="kpi-value" style={{ color: 'var(--gold-text)' }}>{stats.en_alerta}</span>
              <span className="kpi-subtext">&le; 10 días para vencer</span>
            </div>
          </div>

          <div className="kpi-card" onClick={() => setFiltroEstado('vencido')} style={{ cursor: 'pointer' }}>
            <div className="kpi-icon red">🚨</div>
            <div className="kpi-info">
              <span className="kpi-label">SLA Vencido</span>
              <span className="kpi-value" style={{ color: 'var(--danger)' }}>{stats.vencidos}</span>
              <span className="kpi-subtext">Plazo &gt; 45 días superado</span>
            </div>
          </div>
        </div>
      )}

      {error && <Alert kind="error">{error}</Alert>}

      {/* Filtros Ergonómicos */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.8rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem'
      }}>
        {/* Píldoras de estado */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filtro SLA:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'en_tiempo', label: '🟢 En Tiempo' },
            { id: 'proximo_vencer', label: '🟡 Alerta (≤ 10d)' },
            { id: 'vencido', label: '🔴 Vencidos' },
            { id: 'finalizado', label: '🎓 Finalizados' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroEstado(f.id)}
              style={{
                minHeight: '28px',
                fontSize: '0.78rem',
                padding: '0 0.7rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroEstado === f.id ? 'var(--primary)' : 'var(--border-color)',
                background: filtroEstado === f.id ? 'var(--primary)' : '#fff',
                color: filtroEstado === f.id ? '#fff' : 'var(--text-main)',
                fontWeight: filtroEstado === f.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Buscador de graduado o carrera */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Buscar por nombre de graduado, cédula, carnet o carrera…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-search">Buscar</button>
          {searchQuery && (
            <button
              type="button"
              className="btn-stepper btn-close"
              onClick={() => { setSearchQuery(''); cargarProcesos(1, filtroEstado, ''); }}
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <Loading />
      ) : !procesos || procesos.data.length === 0 ? (
        <div className="info-select-graduado">
          No se encontraron procesos de titulación {searchQuery ? `para "${searchQuery}"` : 'con los filtros seleccionados'}.
        </div>
      ) : (
        <>
          <div className="table-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <table>
              <thead>
                <tr>
                  <th>Graduado / Cédula</th>
                  <th>Carrera</th>
                  <th style={{ width: '170px' }}>Avance Administrativo</th>
                  <th>Estado SLA (45 días)</th>
                  <th style={{ textAlign: 'center' }}>Título Físico</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {procesos.data.map((p) => {
                  const progreso = calcularProgreso(p);
                  const tituloFisico = p.titulacion?.titulo_fisico ?? (p.titulacion as unknown as { tituloFisico?: { id: number; ubicacion_actual: string; numero_titulo: string } })?.tituloFisico;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#111' }}>
                          {p.titulacion?.graduado?.nombre_completo || 'Graduado sin registrar'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {p.titulacion?.graduado?.cedula || p.titulacion?.graduado?.carnet || 'Sin documento'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{p.titulacion?.carrera || '—'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                            <span style={{ fontWeight: 600 }}>{progreso.completadas}/{progreso.total} etapas</span>
                            <span style={{ color: 'var(--text-muted)' }}>{progreso.pct}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${progreso.pct}%`,
                                height: '100%',
                                background: progreso.pct === 100 ? 'var(--success)' : 'var(--primary)',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.finalizado ? (
                          <span className="badge green" style={{ fontSize: '0.76rem' }}>
                            ✓ Entregado (Concluido)
                          </span>
                        ) : p.sla_vencido ? (
                          <span className="badge red" style={{ fontSize: '0.76rem' }}>
                            🚨 SLA Vencido ({Math.abs(p.dias_restantes ?? 0)}d excedidos)
                          </span>
                        ) : p.sla_iniciado ? (
                          <span
                            className={`badge ${(p.dias_restantes ?? 45) <= 10 ? 'orange' : 'green'}`}
                            style={{ fontSize: '0.76rem' }}
                          >
                            ⏱️ {(p.dias_restantes ?? 0)} días restantes
                          </span>
                        ) : (
                          <span className="badge gray" style={{ fontSize: '0.76rem' }}>
                            ⏳ Esperando expediente
                          </span>
                        )}
                        {p.fecha_limite_sla && !p.finalizado && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Límite: {fecha(p.fecha_limite_sla)}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {tituloFisico ? (
                          <Link
                            to={`/titulos/${tituloFisico.id}`}
                            style={{ textDecoration: 'none' }}
                            title="Ver trazabilidad física del título"
                          >
                            <Badge value={tituloFisico.ubicacion_actual} />
                          </Link>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Sin cartón físico
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="btn-stepper btn-save"
                          style={{ minHeight: '28px', fontSize: '0.78rem', padding: '0 0.6rem' }}
                          onClick={() => handleOpenProceso(p)}
                        >
                          ⚙️ Etapas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pager page={procesos} onChange={(p) => cargarProcesos(p, filtroEstado, searchQuery)} />
        </>
      )}

      {/* MODAL CHECKLIST INTERACTIVO DE ETAPAS ADMINISTRATIVAS */}
      {isModalOpen && activeProceso && (
        <div className="setec-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="setec-modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>
                📋 Expediente de Titulación · {activeProceso.titulacion?.graduado?.nombre_completo}
              </h3>
              <button type="button" className="close-x-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="modal-content-body">
              {/* Tarjeta superior del expediente y estado de SLA */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.6rem',
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.8rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.84rem'
              }}>
                <div>
                  <div><strong>Graduado:</strong> {activeProceso.titulacion?.graduado?.nombre_completo}</div>
                  <div><strong>Cédula:</strong> {activeProceso.titulacion?.graduado?.cedula || '—'}</div>
                  <div><strong>Carrera:</strong> {activeProceso.titulacion?.carrera}</div>
                </div>
                <div>
                  <div>
                    <strong>Estado Proceso:</strong>{' '}
                    <span className={`badge ${activeProceso.finalizado ? 'green' : 'orange'}`}>
                      {activeProceso.finalizado ? 'Finalizado' : 'En Trámite'}
                    </span>
                  </div>
                  <div>
                    <strong>SLA (45 días):</strong>{' '}
                    {activeProceso.sla_iniciado ? (
                      <span style={{ fontWeight: 700, color: activeProceso.sla_vencido ? 'var(--danger)' : 'var(--success)' }}>
                        {activeProceso.sla_vencido
                          ? `Vencido (${Math.abs(activeProceso.dias_restantes ?? 0)} días de exceso)`
                          : `${activeProceso.dias_restantes ?? 0} días restantes`}
                      </span>
                    ) : (
                      <span className="muted">No iniciado (Falta solicitud o expediente)</span>
                    )}
                  </div>
                  {activeProceso.fecha_inicio_sla && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Iniciado: {fecha(activeProceso.fecha_inicio_sla)} · Límite: {fecha(activeProceso.fecha_limite_sla)}
                    </div>
                  )}
                </div>
              </div>

              {modalFeedback && (
                <div style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '0.8rem',
                  background: modalFeedback.startsWith('✓') ? 'var(--success-soft)' : 'var(--danger-soft)',
                  color: modalFeedback.startsWith('✓') ? 'var(--success)' : 'var(--danger)',
                  border: '1px solid currentColor',
                }}>
                  {modalFeedback}
                </div>
              )}

              {/* Fases del Workflow */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {FASES_WORKFLOW.map((fase, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff',
                    }}
                  >
                    <div style={{
                      background: '#f9fafb',
                      padding: '0.55rem 0.9rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--primary)' }}>{fase.nombre}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{fase.descripcion}</span>
                    </div>

                    <div style={{ padding: '0.6rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {fase.etapas.map((etapa) => {
                        const valor = Boolean((activeProceso as unknown as Record<string, unknown>)[etapa.key]);
                        const isUpdating = updatingEtapa === etapa.key;

                        return (
                          <label
                            key={etapa.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                              background: valor ? 'var(--primary-soft)' : '#fafafa',
                              cursor: can('admin', 'operador') && !activeProceso.finalizado ? 'pointer' : 'default',
                              border: '1px solid',
                              borderColor: valor ? 'var(--primary-border)' : '#e5e7eb',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <input
                                type="checkbox"
                                checked={valor}
                                disabled={!can('admin', 'operador') || activeProceso.finalizado || isUpdating}
                                onChange={() => handleToggleEtapa(etapa.key, valor)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span style={{
                                fontSize: '0.84rem',
                                fontWeight: valor ? 700 : 500,
                                color: etapa.isDanger && valor ? 'var(--danger)' : valor ? '#111' : '#4b5563',
                              }}>
                                {etapa.label}
                              </span>
                            </div>

                            {isUpdating ? (
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Guardando…</span>
                            ) : valor ? (
                              <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 700 }}>
                                ✓ Completado
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Pendiente</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Los cambios se guardan y auditan en tiempo real.
              </span>
              <button
                type="button"
                className="btn-stepper btn-close"
                onClick={() => setIsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
