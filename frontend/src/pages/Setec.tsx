import { useState, useEffect } from 'react';
import { api, type Page } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, Loading, Pager, fecha } from '../components/ui';
import type { Lote, TituloFisico, LoteDetalle } from '../api/types';
import QrScannerModal from '../components/QrScannerModal';
import GuiaRemisionModal from '../components/GuiaRemisionModal';

export default function Setec() {
  const { can } = useAuth();
  const [lotes, setLotes] = useState<Page<Lote> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de modales
  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [isCertificarOpen, setIsCertificarOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGuiaOpen, setIsGuiaOpen] = useState(false);

  // Datos para armado y certificación
  const [disponibles, setDisponibles] = useState<TituloFisico[]>([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState(false);
  const [selectedTituloIds, setSelectedTituloIds] = useState<number[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [activeLote, setActiveLote] = useState<Lote | null>(null);
  const [guiaTipo, setGuiaTipo] = useState<'SETEC_SALIDA' | 'SETEC_RETORNO'>('SETEC_SALIDA');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Observación individual para certificar
  const [observacionCert, setObservacionCert] = useState<Record<number, string>>({});

  const cargarLotes = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Page<Lote>>(`/setec?page=${page}`);
      setLotes(data);
      setCurrentPage(data.current_page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los lotes de SETEC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLotes(currentPage);
  }, [currentPage]);

  // Cargar títulos disponibles en León para enviar a SETEC
  const handleOpenCrear = async () => {
    setIsCrearOpen(true);
    setSelectedTituloIds([]);
    setObservaciones('');
    setScanFeedback(null);
    setLoadingDisponibles(true);
    try {
      const data = await api<TituloFisico[]>('/setec/disponibles');
      setDisponibles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar títulos disponibles');
    } finally {
      setLoadingDisponibles(false);
    }
  };

  // Manejador del escaneo QR mediante móvil o pistola
  const handleScanCode = (code: string) => {
    const cleanCode = code.trim().toLowerCase();
    const encontrado = disponibles.find(
      (t) =>
        t.numero_titulo.toLowerCase() === cleanCode ||
        t.uuid.toLowerCase() === cleanCode ||
        (t.titulacion?.graduado?.cedula && t.titulacion.graduado.cedula.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanCode.replace(/[^a-z0-9]/g, ''))
    );

    if (encontrado) {
      if (!selectedTituloIds.includes(encontrado.id)) {
        setSelectedTituloIds((prev) => [...prev, encontrado.id]);
        setScanFeedback(`✓ Título ${encontrado.numero_titulo} (${encontrado.titulacion?.graduado?.nombre_completo}) agregado para SETEC.`);
      } else {
        setScanFeedback(`ℹ El título ${encontrado.numero_titulo} ya estaba seleccionado.`);
      }
    } else {
      setScanFeedback(`⚠️ Código "${code}" no encontrado entre los títulos disponibles en León.`);
    }
  };

  // Enviar Lote a SETEC
  const handleCrearLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTituloIds.length === 0) {
      alert('Debe seleccionar al menos un título para generar el lote SETEC.');
      return;
    }

    try {
      const nuevoLote = await api<Lote>('/setec', {
        method: 'POST',
        body: {
          titulos: selectedTituloIds,
          observaciones: observaciones.trim() || undefined,
        },
      });

      setIsCrearOpen(false);
      setActiveLote(nuevoLote);
      setGuiaTipo('SETEC_SALIDA');
      setIsGuiaOpen(true);
      cargarLotes(1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear lote SETEC');
    }
  };

  // Abrir modal de certificación y detalle
  const handleOpenCertificar = async (loteId: number) => {
    try {
      const loteCompleto = await api<Lote>(`/setec/${loteId}`);
      setActiveLote(loteCompleto);
      setIsCertificarOpen(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cargar detalle del lote');
    }
  };

  // Calificar título individual en SETEC (CERTIFICADO, OBSERVADO, NO_RECIBIDO)
  const handleCalificarTitulo = async (detalleId: number, estado: 'CERTIFICADO' | 'OBSERVADO' | 'NO_RECIBIDO') => {
    const obs = observacionCert[detalleId];
    if (estado === 'OBSERVADO' && !obs?.trim()) {
      alert('Debe ingresar el motivo de observación para este título.');
      return;
    }

    try {
      const detalleActualizado = await api<LoteDetalle>(`/setec/detalle/${detalleId}/certificacion`, {
        method: 'POST',
        body: {
          estado,
          observacion: obs?.trim() || undefined,
        },
      });

      if (activeLote && activeLote.detalle) {
        const nuevoDetalle = activeLote.detalle.map((d) => (d.id === detalleId ? { ...d, ...detalleActualizado } : d));
        setActiveLote({ ...activeLote, detalle: nuevoDetalle });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al calificar certificación');
    }
  };

  // Registrar Retorno desde SETEC
  const handleRegistrarRetorno = async () => {
    if (!activeLote) return;
    if (!confirm(`¿Confirmar recepción del lote ${activeLote.numero_lote} y retorno de títulos a León?`)) return;

    try {
      const loteActualizado = await api<Lote>(`/setec/${activeLote.id}/retorno`, {
        method: 'POST',
        body: {
          observaciones: observaciones.trim() || undefined,
        },
      });

      setIsCertificarOpen(false);
      setActiveLote(loteActualizado);
      setGuiaTipo('SETEC_RETORNO');
      setIsGuiaOpen(true);
      cargarLotes(currentPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar retorno de SETEC');
    }
  };

  // Cálculo en tiempo real de SLA para SETEC (10 días)
  const calcularSla = (lote: Lote) => {
    if (lote.estado === 'RETORNADO') {
      return { texto: 'Retornado', badgeColor: 'green' };
    }

    const fechaSalida = new Date(lote.fecha_envio || lote.created_at).getTime();
    const diffMs = Date.now() - fechaSalida;
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let badgeColor = 'green';
    if (dias >= 10) {
      badgeColor = 'red';
    } else if (dias >= 7) {
      badgeColor = 'orange';
    }

    return {
      texto: `${dias}d ${horas}h (SLA máx: 10d)`,
      badgeColor,
    };
  };

  return (
    <section>
      <div className="toolbar" style={{ marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            🏛️ Lotes de Certificación SETEC
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (Registro y Certificación Oficial Managua)
            </span>
          </h1>
        </div>

        {can('admin', 'operador') && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-search"
              onClick={handleOpenCrear}
              style={{ background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>+ Nuevo Envío a SETEC</span>
            </button>
          </div>
        )}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Loading />
      ) : !lotes || lotes.data.length === 0 ? (
        <div className="info-select-graduado">
          No hay lotes SETEC registrados actualmente. Presione <strong>+ Nuevo Envío a SETEC</strong> para preparar el primer lote con su guía de remisión.
        </div>
      ) : (
        <>
          <div className="table-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <table>
              <thead>
                <tr>
                  <th>N.º Lote SETEC</th>
                  <th>Fecha de Salida</th>
                  <th>Tiempo en SETEC (SLA)</th>
                  <th style={{ textAlign: 'center' }}>Total Títulos</th>
                  <th>Responsable Emisión</th>
                  <th style={{ textAlign: 'center' }}>Estado Lote</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lotes.data.map((lote) => {
                  const sla = calcularSla(lote);
                  const total = lote.detalle?.length ?? 0;
                  return (
                    <tr key={lote.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{lote.numero_lote}</td>
                      <td>{fecha(lote.fecha_envio || lote.created_at)}</td>
                      <td>
                        <span className={`badge ${sla.badgeColor}`} style={{ fontSize: '0.78rem' }}>
                          ⏱️ {sla.texto}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{total}</td>
                      <td>{lote.responsable_envio?.name || lote.responsableEnvio?.name || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge value={lote.estado} />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {/* Ver e imprimir Guía de Remisión Oficial */}
                          <button
                            type="button"
                            className="btn-stepper btn-close"
                            style={{ minHeight: '28px', fontSize: '0.78rem', padding: '0 0.55rem' }}
                            onClick={() => {
                              setActiveLote(lote);
                              setGuiaTipo(lote.estado === 'RETORNADO' ? 'SETEC_RETORNO' : 'SETEC_SALIDA');
                              setIsGuiaOpen(true);
                            }}
                            title="Ver e Imprimir Guía Oficial"
                          >
                            📄 Guía
                          </button>

                          {/* Gestión de Certificación y Retorno */}
                          <button
                            type="button"
                            className="btn-stepper btn-save"
                            style={{ minHeight: '28px', fontSize: '0.78rem', padding: '0 0.55rem' }}
                            onClick={() => handleOpenCertificar(lote.id)}
                            title="Gestionar certificación por título y retorno"
                          >
                            {lote.estado === 'ENVIADO' ? '📝 Certificar / Retorno' : '🔍 Ver Certificaciones'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pager page={lotes} onChange={(p) => setCurrentPage(p)} />
        </>
      )}

      {/* MODAL: Nuevo Envío a SETEC con Escáner Móvil */}
      {isCrearOpen && (
        <div className="setec-modal-backdrop" onClick={() => setIsCrearOpen(false)}>
          <div className="setec-modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>🏛️ Crear Nuevo Lote de Envío a SETEC (Managua)</h3>
              <button type="button" className="close-x-btn" onClick={() => setIsCrearOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCrearLote}>
              <div className="modal-content-body">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  gap: '0.6rem',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#111' }}>
                      Selección de Títulos Listos en León
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Total seleccionados: <strong>{selectedTituloIds.length}</strong> de {disponibles.length} títulos disponibles
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-search"
                    style={{ background: 'var(--gold)', color: '#2b1d00', fontWeight: 700, minHeight: '32px', fontSize: '0.82rem' }}
                    onClick={() => setIsScannerOpen(true)}
                  >
                    📱 Escanear con Teléfono Móvil / Lector
                  </button>
                </div>

                {scanFeedback && (
                  <div style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    marginBottom: '0.7rem',
                    background: scanFeedback.startsWith('✓') ? 'var(--success-soft)' : scanFeedback.startsWith('ℹ') ? '#f0f9ff' : 'var(--danger-soft)',
                    color: scanFeedback.startsWith('✓') ? 'var(--success)' : scanFeedback.startsWith('ℹ') ? '#0369a1' : 'var(--danger)',
                    border: '1px solid currentColor',
                  }}>
                    {scanFeedback}
                  </div>
                )}

                {loadingDisponibles ? (
                  <Loading />
                ) : disponibles.length === 0 ? (
                  <div className="warning-empty-banner">
                    ⚠️ No hay títulos físicos con ubicación actual <strong>LEON</strong> listos para ser enviados a SETEC.
                  </div>
                ) : (
                  <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <table style={{ width: '100%', fontSize: '0.82rem' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#f3f4f6' }}>
                        <tr>
                          <th style={{ width: '38px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedTituloIds.length > 0 && selectedTituloIds.length === disponibles.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTituloIds(disponibles.map((t) => t.id));
                                } else {
                                  setSelectedTituloIds([]);
                                }
                              }}
                            />
                          </th>
                          <th>N.º Título</th>
                          <th>Graduado</th>
                          <th>Carrera</th>
                          <th>Lib/Tom/Fol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disponibles.map((t) => {
                          const isChecked = selectedTituloIds.includes(t.id);
                          return (
                            <tr
                              key={t.id}
                              style={{ background: isChecked ? 'var(--primary-soft)' : 'transparent', cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedTituloIds((prev) =>
                                  isChecked ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                                );
                              }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                />
                              </td>
                              <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.numero_titulo}</td>
                              <td>{t.titulacion?.graduado?.nombre_completo || '—'}</td>
                              <td>{t.titulacion?.carrera || '—'}</td>
                              <td>{[t.libro, t.tomo, t.folio].filter(Boolean).join('/') || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div style={{ marginTop: '0.9rem' }}>
                  <label htmlFor="obs-setec-envio" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Observaciones / Oficio de Remisión a SETEC:
                  </label>
                  <input
                    id="obs-setec-envio"
                    type="text"
                    placeholder="Ej. Oficio SG-UNCPGGL-2026-088 para registro y certificación..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Al confirmar, se generará la Guía de Remisión Oficial para SETEC.
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-stepper btn-close" onClick={() => setIsCrearOpen(false)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-stepper btn-save"
                    disabled={selectedTituloIds.length === 0}
                  >
                    ✓ Confirmar y Generar Guía
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Certificación y Retorno SETEC */}
      {isCertificarOpen && activeLote && (
        <div className="setec-modal-backdrop" onClick={() => setIsCertificarOpen(false)}>
          <div className="setec-modal" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>📝 Calificación de Certificación SETEC · Lote {activeLote.numero_lote}</h3>
              <button type="button" className="close-x-btn" onClick={() => setIsCertificarOpen(false)}>✕</button>
            </div>

            <div className="modal-content-body">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem',
                fontSize: '0.86rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div><strong>Lote:</strong> {activeLote.numero_lote}</div>
                <div><strong>Fecha Salida:</strong> {fecha(activeLote.fecha_envio || activeLote.created_at)}</div>
                <div><strong>Estado Lote:</strong> <Badge value={activeLote.estado} /></div>
                <div><strong>Total Títulos:</strong> {activeLote.detalle?.length ?? 0}</div>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f3f4f6' }}>
                    <tr>
                      <th>N.º Título</th>
                      <th>Graduado</th>
                      <th>Dictamen SETEC</th>
                      <th>Observación</th>
                      {activeLote.estado === 'ENVIADO' && can('admin', 'operador') && (
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeLote.detalle?.map((d) => {
                      const titulo = d.titulo_fisico ?? d.tituloFisico;
                      const estadoCert = d.estado || 'PENDIENTE';
                      return (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {titulo?.numero_titulo || '—'}
                          </td>
                          <td>
                            <div><strong>{titulo?.titulacion?.graduado?.nombre_completo || '—'}</strong></div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {titulo?.titulacion?.carrera}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              estadoCert === 'CERTIFICADO' ? 'green' : estadoCert === 'OBSERVADO' ? 'orange' : estadoCert === 'NO_RECIBIDO' ? 'red' : 'gray'
                            }`}>
                              {estadoCert}
                            </span>
                          </td>
                          <td>
                            {activeLote.estado === 'ENVIADO' && can('admin', 'operador') ? (
                              <input
                                type="text"
                                placeholder="Observación SETEC…"
                                defaultValue={d.observacion || ''}
                                onChange={(e) => setObservacionCert({ ...observacionCert, [d.id]: e.target.value })}
                                style={{ fontSize: '0.76rem', minHeight: '26px', padding: '0 0.35rem', width: '100%' }}
                              />
                            ) : (
                              d.observacion || '—'
                            )}
                          </td>
                          {activeLote.estado === 'ENVIADO' && can('admin', 'operador') && (
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                                <button
                                  type="button"
                                  className="btn-stepper btn-save"
                                  style={{ minHeight: '26px', fontSize: '0.74rem', padding: '0 0.45rem' }}
                                  onClick={() => handleCalificarTitulo(d.id, 'CERTIFICADO')}
                                  title="Marcar como Certificado"
                                >
                                  ✓ Certificado
                                </button>
                                <button
                                  type="button"
                                  style={{ background: 'var(--gold)', color: '#2b1d00', border: 'none', borderRadius: '4px', minHeight: '26px', fontSize: '0.74rem', padding: '0 0.45rem', fontWeight: 600 }}
                                  onClick={() => handleCalificarTitulo(d.id, 'OBSERVADO')}
                                  title="Marcar como Observado"
                                >
                                  ⚠️ Observado
                                </button>
                                <button
                                  type="button"
                                  className="btn-trash"
                                  style={{ minHeight: '26px', fontSize: '0.74rem', padding: '0 0.45rem' }}
                                  onClick={() => handleCalificarTitulo(d.id, 'NO_RECIBIDO')}
                                  title="Marcar como No Recibido"
                                >
                                  ✕ No recibido
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-stepper btn-close"
                onClick={() => setIsCertificarOpen(false)}
              >
                Cerrar
              </button>

              {activeLote.estado === 'ENVIADO' && can('admin', 'operador') && (
                <button
                  type="button"
                  className="btn-stepper btn-save"
                  onClick={handleRegistrarRetorno}
                >
                  📥 Confirmar Retorno de SETEC a León
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Escáner QR con Móvil */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
        continuous={true}
        title="Escanear Título para Envío SETEC"
      />

      {/* MODAL: Guía de Remisión Oficial Imprimible */}
      <GuiaRemisionModal
        isOpen={isGuiaOpen}
        onClose={() => setIsGuiaOpen(false)}
        lote={activeLote}
        tipoTrámite={guiaTipo}
      />
    </section>
  );
}
