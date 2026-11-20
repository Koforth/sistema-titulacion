import { useState, useEffect } from 'react';
import { api, type Page } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, Loading, Pager, fecha } from '../components/ui';
import type { Lote, TituloFisico } from '../api/types';
import QrScannerModal from '../components/QrScannerModal';
import GuiaRemisionModal from '../components/GuiaRemisionModal';

export default function Impresion() {
  const { can } = useAuth();
  const [lotes, setLotes] = useState<Page<Lote> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de modales
  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [isRetornoOpen, setIsRetornoOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGuiaOpen, setIsGuiaOpen] = useState(false);

  // Datos para armado y retorno
  const [disponibles, setDisponibles] = useState<TituloFisico[]>([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState(false);
  const [selectedTituloIds, setSelectedTituloIds] = useState<number[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [activeLote, setActiveLote] = useState<Lote | null>(null);
  const [guiaTipo, setGuiaTipo] = useState<'IMPRENTA_SALIDA' | 'IMPRENTA_RETORNO'>('IMPRENTA_SALIDA');
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const cargarLotes = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Page<Lote>>(`/impresion?page=${page}`);
      setLotes(data);
      setCurrentPage(data.current_page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los lotes de impresión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLotes(currentPage);
  }, [currentPage]);

  // Cargar títulos disponibles en León al abrir modal de creación
  const handleOpenCrear = async () => {
    setIsCrearOpen(true);
    setSelectedTituloIds([]);
    setObservaciones('');
    setScanFeedback(null);
    setLoadingDisponibles(true);
    try {
      const data = await api<TituloFisico[]>('/impresion/disponibles');
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
        setScanFeedback(`✓ Título ${encontrado.numero_titulo} (${encontrado.titulacion?.graduado?.nombre_completo}) agregado al lote.`);
      } else {
        setScanFeedback(`ℹ El título ${encontrado.numero_titulo} ya estaba seleccionado.`);
      }
    } else {
      setScanFeedback(`⚠️ Código "${code}" no encontrado entre los títulos disponibles en León.`);
    }
  };

  // Enviar Lote a Imprenta
  const handleCrearLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTituloIds.length === 0) {
      alert('Debe seleccionar al menos un título para generar el lote.');
      return;
    }

    try {
      const nuevoLote = await api<Lote>('/impresion', {
        method: 'POST',
        body: {
          titulos: selectedTituloIds,
          observaciones: observaciones.trim() || undefined,
        },
      });

      setIsCrearOpen(false);
      setActiveLote(nuevoLote);
      setGuiaTipo('IMPRENTA_SALIDA');
      setIsGuiaOpen(true);
      cargarLotes(1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear lote de impresión');
    }
  };

  // Registrar Retorno desde Imprenta
  const handleRegistrarRetorno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLote) return;

    try {
      const loteActualizado = await api<Lote>(`/impresion/${activeLote.id}/retorno`, {
        method: 'POST',
        body: {
          observaciones: observaciones.trim() || undefined,
        },
      });

      setIsRetornoOpen(false);
      setActiveLote(loteActualizado);
      setGuiaTipo('IMPRENTA_RETORNO');
      setIsGuiaOpen(true);
      cargarLotes(currentPage);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar retorno del lote');
    }
  };

  // Cálculo en tiempo real del tiempo de permanencia y SLA
  const calcularSla = (lote: Lote) => {
    if (lote.estado === 'RETORNADO') {
      return { texto: 'Retornado', badgeColor: 'green', dias: 0 };
    }

    const fechaSalida = new Date(lote.fecha_envio || lote.created_at).getTime();
    const ahora = Date.now();
    const diffMs = ahora - fechaSalida;
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // SLA: 5 días hábiles
    let badgeColor = 'green';
    if (dias >= 5) {
      badgeColor = 'red';
    } else if (dias >= 3) {
      badgeColor = 'orange';
    }

    return {
      texto: `${dias}d ${horas}h (SLA máx: 5d)`,
      badgeColor,
      dias,
    };
  };

  return (
    <section>
      <div className="toolbar" style={{ marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            🖨️ Lotes de Imprenta
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (Traslado y Control León ⇄ Managua)
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
              <span>+ Nuevo Envío a Imprenta</span>
            </button>
          </div>
        )}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <Loading />
      ) : !lotes || lotes.data.length === 0 ? (
        <div className="info-select-graduado">
          No hay lotes de impresión registrados actualmente. Presione <strong>+ Nuevo Envío a Imprenta</strong> para generar el primer lote con su guía de remisión.
        </div>
      ) : (
        <>
          <div className="table-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <table>
              <thead>
                <tr>
                  <th>N.º Lote</th>
                  <th>Fecha de Salida</th>
                  <th>Tiempo en Imprenta (SLA)</th>
                  <th style={{ textAlign: 'center' }}>Total Títulos</th>
                  <th>Responsable Emisión</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
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
                          {/* Ver / Imprimir Guía de Remisión */}
                          <button
                            type="button"
                            className="btn-stepper btn-close"
                            style={{ minHeight: '28px', fontSize: '0.78rem', padding: '0 0.55rem' }}
                            onClick={() => {
                              setActiveLote(lote);
                              setGuiaTipo(lote.estado === 'RETORNADO' ? 'IMPRENTA_RETORNO' : 'IMPRENTA_SALIDA');
                              setIsGuiaOpen(true);
                            }}
                            title="Ver e Imprimir Guía de Remisión Oficial"
                          >
                            📄 Guía
                          </button>

                          {/* Botón para registrar retorno */}
                          {lote.estado === 'ENVIADO' && can('admin', 'operador') && (
                            <button
                              type="button"
                              className="btn-stepper btn-save"
                              style={{ minHeight: '28px', fontSize: '0.78rem', padding: '0 0.55rem' }}
                              onClick={() => {
                                setActiveLote(lote);
                                setObservaciones('');
                                setIsRetornoOpen(true);
                              }}
                              title="Registrar retorno del lote a León"
                            >
                              📥 Recibir en León
                            </button>
                          )}
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

      {/* MODAL: Nuevo Envío a Imprenta con Escáner Móvil */}
      {isCrearOpen && (
        <div className="setec-modal-backdrop" onClick={() => setIsCrearOpen(false)}>
          <div className="setec-modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>📦 Crear Nuevo Lote de Envío a Imprenta (Managua)</h3>
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
                    ⚠️ No hay títulos físicos con ubicación actual <strong>LEON</strong> listos para ser enviados a imprenta.
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
                                  onChange={() => {}} // Manejado por onClick de fila
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
                  <label htmlFor="obs-envio" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Observaciones / Instrucciones de Envío a Imprenta:
                  </label>
                  <input
                    id="obs-envio"
                    type="text"
                    placeholder="Ej. Remesa especial con sellos dorados para ceremonia..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Al confirmar, se generará la Guía de Remisión Oficial para firmas.
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

      {/* MODAL: Registrar Retorno desde Imprenta */}
      {isRetornoOpen && activeLote && (
        <div className="setec-modal-backdrop" onClick={() => setIsRetornoOpen(false)}>
          <div className="setec-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>📥 Registrar Retorno de Lote ({activeLote.numero_lote}) a León</h3>
              <button type="button" className="close-x-btn" onClick={() => setIsRetornoOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleRegistrarRetorno}>
              <div className="modal-content-body">
                <div style={{
                  background: 'var(--primary-soft)',
                  padding: '0.8rem 1rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.86rem'
                }}>
                  <div><strong>Lote:</strong> {activeLote.numero_lote}</div>
                  <div><strong>Fecha de Salida:</strong> {fecha(activeLote.fecha_envio || activeLote.created_at)}</div>
                  <div><strong>Total de Títulos a Recibir:</strong> {activeLote.detalle?.length ?? 0} títulos</div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.7rem' }}>
                  Al registrar el retorno, los {activeLote.detalle?.length ?? 0} títulos del lote pasarán formalmente a custodia en la <strong>Sede Central León</strong> y se registrará la recepción con fecha/hora actual y el usuario en sesión.
                </p>

                <div style={{ marginTop: '0.6rem' }}>
                  <label htmlFor="obs-retorno" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                    Control de Calidad / Observaciones de Recepción:
                  </label>
                  <textarea
                    id="obs-retorno"
                    placeholder="Ej. Títulos recibidos conformes, sin manchas ni defectos de caligrafía."
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer-nav" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="btn-stepper btn-close" onClick={() => setIsRetornoOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-stepper btn-save">
                  📥 Confirmar Recepción en León
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Escáner QR con Móvil */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
        continuous={true}
        title="Escanear Título Físico con el Móvil"
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
