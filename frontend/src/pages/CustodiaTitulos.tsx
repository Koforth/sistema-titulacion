import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, type Page } from '../api/client';
import { Alert, Badge, Loading, Pager, fecha } from '../components/ui';
import type { TituloFisico, ResumenUbicaciones } from '../api/types';
import QrScannerModal from '../components/QrScannerModal';
import GuiaRemisionModal from '../components/GuiaRemisionModal';

// Sub-componentes ya construidos para Impresión, SETEC y Entrega
import Impresion from './Impresion';
import Setec from './Setec';
import Entrega from './Entrega';

export type TabKey = 'inventario' | 'impresion' | 'setec' | 'entrega';

interface CustodiaTitulosProps {
  defaultTab?: TabKey;
}

export default function CustodiaTitulos({ defaultTab = 'inventario' }: CustodiaTitulosProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab activo sincronizado con query param o prop
  const activeTab = (searchParams.get('tab') as TabKey) || defaultTab;

  const setActiveTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  // Resumen de ubicaciones para el KPI Bar superior
  const [resumen, setResumen] = useState<ResumenUbicaciones | null>(null);

  // Estados para pestaña Inventario
  const [titulos, setTitulos] = useState<Page<TituloFisico> | null>(null);
  const [loadingTitulos, setLoadingTitulos] = useState(false);
  const [inventarioPage, setInventarioPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState<string>('todos');

  // Escáner inteligente global
  const [isSmartScannerOpen, setIsSmartScannerOpen] = useState(false);
  const [scanResultTitulo, setScanResultTitulo] = useState<TituloFisico | null>(null);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);

  const cargarResumen = async () => {
    try {
      const data = await api<ResumenUbicaciones>('/titulos-fisicos/resumen-ubicaciones');
      setResumen(data);
    } catch {
      // Si falla, el usuario aún puede operar
    }
  };

  const cargarInventario = async (page = 1, u = filtroUbicacion, q = searchQuery) => {
    setLoadingTitulos(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (u && u !== 'todos') params.append('ubicacion', u);
      if (q.trim()) params.append('q', q.trim());

      const data = await api<Page<TituloFisico>>(`/titulos-fisicos?${params.toString()}`);
      setTitulos(data);
      setInventarioPage(data.current_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTitulos(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'inventario') {
      cargarInventario(1, filtroUbicacion, searchQuery);
    }
  }, [activeTab, filtroUbicacion]);

  // Manejador del Escáner Inteligente Global
  const handleSmartScan = async (code: string) => {
    try {
      // Buscar el título por código QR / número / UUID
      const res = await api<Page<TituloFisico>>(`/titulos-fisicos?q=${encodeURIComponent(code)}`);
      if (res.data && res.data.length > 0) {
        const titulo = res.data[0];
        setScanResultTitulo(titulo);
        setIsSmartModalOpen(true);
      } else {
        alert(`No se encontró ningún título físico correspondiente al código: ${code}`);
      }
    } catch (err: unknown) {
      alert(`Error al consultar título: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  return (
    <section>
      {/* Cabecera Principal del Módulo Unificado */}
      <div className="toolbar" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            📜 Custodia y Trazabilidad Física
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (Sede León ⇄ Imprenta Managua ⇄ SETEC ⇄ Entrega)
            </span>
          </h1>
        </div>

        <button
          type="button"
          className="btn-search"
          style={{
            background: 'var(--gold)',
            color: '#2b1d00',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onClick={() => setIsSmartScannerOpen(true)}
        >
          📱 Escaneo Inteligente con Móvil
        </button>
      </div>

      {/* KPI Bar Superior: Distribución en Tiempo Real de Custodia */}
      {resumen && (
        <div className="kpis-grid" style={{ marginBottom: '1.2rem' }}>
          <div
            className="kpi-card"
            style={{ cursor: 'pointer', borderLeftColor: '#0284c7' }}
            onClick={() => { setActiveTab('inventario'); setFiltroUbicacion('LEON'); }}
            title="Ver títulos ubicados físicamente en León"
          >
            <div className="kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>🏢</div>
            <div className="kpi-body">
              <span className="kpi-label">En Sede León</span>
              <b className="kpi-value" style={{ color: '#0284c7' }}>{resumen.leon}</b>
              <span className="kpi-subtext">Listos para procesar o entregar</span>
            </div>
          </div>

          <div
            className="kpi-card kpi-orange"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('impresion')}
            title="Ir a pestaña de Imprenta Managua"
          >
            <div className="kpi-icon">🖨️</div>
            <div className="kpi-body">
              <span className="kpi-label">En Imprenta (Managua)</span>
              <b className="kpi-value">{resumen.imprenta}</b>
              <span className="kpi-subtext">En proceso de impresión / sellado</span>
            </div>
          </div>

          <div
            className="kpi-card"
            style={{ cursor: 'pointer', borderLeftColor: '#7e22ce' }}
            onClick={() => setActiveTab('setec')}
            title="Ir a pestaña de Certificación SETEC"
          >
            <div className="kpi-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>🏛️</div>
            <div className="kpi-body">
              <span className="kpi-label">En SETEC (Managua)</span>
              <b className="kpi-value" style={{ color: '#7e22ce' }}>{resumen.setec}</b>
              <span className="kpi-subtext">En certificación y registro oficial</span>
            </div>
          </div>

          <div
            className="kpi-card kpi-green"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('entrega')}
            title="Ir a pestaña de Ventanilla de Entrega"
          >
            <div className="kpi-icon">🎓</div>
            <div className="kpi-body">
              <span className="kpi-label">Entregados al Graduado</span>
              <b className="kpi-value">{resumen.entregado}</b>
              <span className="kpi-subtext">{resumen.total} títulos físicos totales</span>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Pestañas (Segmented Navigation) */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '1.2rem',
        gap: '0.4rem',
        overflowX: 'auto',
      }}>
        {[
          { key: 'inventario', icon: '📋', label: '1. Inventario General' },
          { key: 'impresion', icon: '🖨️', label: '2. Lotes Imprenta' },
          { key: 'setec', icon: '🏛️', label: '3. Certificación SETEC' },
          { key: 'entrega', icon: '🎓', label: '4. Ventanilla de Entrega' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              style={{
                minHeight: '38px',
                padding: '0.5rem 1.1rem',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENIDO DE PESTAÑAS */}

      {/* PESTAÑA 1: INVENTARIO GENERAL */}
      {activeTab === 'inventario' && (
        <div>
          {/* Barra de Filtros de Inventario */}
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
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ubicación:</span>
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'LEON', label: '🏢 En León' },
                { id: 'IMPRENTA', label: '🖨️ En Imprenta' },
                { id: 'SETEC', label: '🏛️ En SETEC' },
                { id: 'ENTREGADO', label: '🎓 Entregados' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltroUbicacion(f.id)}
                  style={{
                    minHeight: '28px',
                    fontSize: '0.78rem',
                    padding: '0 0.7rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: filtroUbicacion === f.id ? 'var(--primary)' : 'var(--border-color)',
                    background: filtroUbicacion === f.id ? 'var(--primary)' : '#fff',
                    color: filtroUbicacion === f.id ? '#fff' : 'var(--text-main)',
                    fontWeight: filtroUbicacion === f.id ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); cargarInventario(1, filtroUbicacion, searchQuery); }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                placeholder="Buscar por N.º de título, graduado, cédula o libro/tomo/folio…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-search">Buscar</button>
              {searchQuery && (
                <button
                  type="button"
                  className="btn-stepper btn-close"
                  onClick={() => { setSearchQuery(''); cargarInventario(1, filtroUbicacion, ''); }}
                >
                  Limpiar
                </button>
              )}
            </form>
          </div>

          {loadingTitulos ? (
            <Loading />
          ) : !titulos || titulos.data.length === 0 ? (
            <div className="info-select-graduado">
              No se encontraron títulos físicos {searchQuery ? `para "${searchQuery}"` : 'con los filtros seleccionados'}.
            </div>
          ) : (
            <>
              <div className="table-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>N.º Título</th>
                      <th>Graduado / Cédula</th>
                      <th>Carrera</th>
                      <th>Libro/Tomo/Folio</th>
                      <th style={{ textAlign: 'center' }}>Ubicación Actual</th>
                      <th style={{ textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {titulos.data.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          <Link to={`/titulos/${t.id}`}>{t.numero_titulo}</Link>
                        </td>
                        <td>
                          <div><strong>{t.titulacion?.graduado?.nombre_completo || '—'}</strong></div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {t.titulacion?.graduado?.cedula || t.titulacion?.graduado?.carnet || 'Sin doc'}
                          </div>
                        </td>
                        <td>{t.titulacion?.carrera || '—'}</td>
                        <td>{[t.libro, t.tomo, t.folio].filter(Boolean).join('/') || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge value={t.ubicacion_actual} />
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <Link
                            to={`/titulos/${t.id}`}
                            className="btn-stepper btn-close"
                            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', padding: '0 0.6rem', fontSize: '0.78rem', minHeight: '28px' }}
                          >
                            👁️ Trazabilidad
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pager page={titulos} onChange={(p) => cargarInventario(p, filtroUbicacion, searchQuery)} />
            </>
          )}
        </div>
      )}

      {/* PESTAÑA 2: LOTES DE IMPRENTA */}
      {activeTab === 'impresion' && <Impresion />}

      {/* PESTAÑA 3: CERTIFICACIÓN SETEC */}
      {activeTab === 'setec' && <Setec />}

      {/* PESTAÑA 4: VENTANILLA DE ENTREGA */}
      {activeTab === 'entrega' && <Entrega />}

      {/* MODAL DEL ESCÁNER INTELIGENTE GLOBAL */}
      <QrScannerModal
        isOpen={isSmartScannerOpen}
        onClose={() => setIsSmartScannerOpen(false)}
        onScan={handleSmartScan}
        title="Escaneo Inteligente de Custodia (Móvil / QR)"
      />

      {/* MODAL DE RESULTADO DEL ESCANEO INTELIGENTE */}
      {isSmartModalOpen && scanResultTitulo && (
        <div className="setec-modal-backdrop" onClick={() => setIsSmartModalOpen(false)}>
          <div className="setec-modal" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>🎯 Título Identificado · N.º {scanResultTitulo.numero_titulo}</h3>
              <button type="button" className="close-x-btn" onClick={() => setIsSmartModalOpen(false)}>✕</button>
            </div>

            <div className="modal-content-body">
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                fontSize: '0.86rem',
              }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.3rem' }}>
                  {scanResultTitulo.titulacion?.graduado?.nombre_completo}
                </div>
                <div><strong>Carrera:</strong> {scanResultTitulo.titulacion?.carrera}</div>
                <div><strong>Cédula:</strong> {scanResultTitulo.titulacion?.graduado?.cedula || '—'}</div>
                <div><strong>Libro/Tomo/Folio:</strong> {[scanResultTitulo.libro, scanResultTitulo.tomo, scanResultTitulo.folio].filter(Boolean).join('/') || '—'}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>Ubicación Actual:</strong>
                  <Badge value={scanResultTitulo.ubicacion_actual} />
                </div>
              </div>

              {/* Acciones contextuales inteligentes */}
              <h4 style={{ margin: '0.8rem 0 0.5rem', fontSize: '0.9rem', color: '#111' }}>
                Acciones sugeridas según su ubicación:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {scanResultTitulo.ubicacion_actual === 'LEON' && (
                  <>
                    <button
                      type="button"
                      className="btn-stepper btn-save"
                      onClick={() => {
                        setIsSmartModalOpen(false);
                        setActiveTab('impresion');
                      }}
                    >
                      🖨️ Despachar en Lote a Imprenta Managua
                    </button>
                    <button
                      type="button"
                      style={{ background: 'var(--gold)', color: '#2b1d00', border: 'none', borderRadius: '6px', minHeight: '34px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => {
                        setIsSmartModalOpen(false);
                        setActiveTab('setec');
                      }}
                    >
                      🏛️ Despachar a Certificación SETEC
                    </button>
                    <button
                      type="button"
                      style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', minHeight: '34px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => {
                        setIsSmartModalOpen(false);
                        setActiveTab('entrega');
                      }}
                    >
                      🎓 Proceder a Entrega al Graduado
                    </button>
                  </>
                )}

                {scanResultTitulo.ubicacion_actual === 'IMPRENTA' && (
                  <button
                    type="button"
                    className="btn-stepper btn-save"
                    onClick={() => {
                      setIsSmartModalOpen(false);
                      setActiveTab('impresion');
                    }}
                  >
                    📥 Registrar Retorno de Imprenta a León
                  </button>
                )}

                {scanResultTitulo.ubicacion_actual === 'SETEC' && (
                  <button
                    type="button"
                    className="btn-stepper btn-save"
                    onClick={() => {
                      setIsSmartModalOpen(false);
                      setActiveTab('setec');
                    }}
                  >
                    📝 Gestionar Dictamen y Retorno de SETEC
                  </button>
                )}

                {scanResultTitulo.ubicacion_actual === 'ENTREGADO' && (
                  <button
                    type="button"
                    className="btn-stepper btn-save"
                    onClick={() => {
                      setIsActaModalOpen(true);
                    }}
                  >
                    📄 Ver / Reimprimir Acta Oficial de Retiro
                  </button>
                )}

                <button
                  type="button"
                  className="btn-stepper btn-close"
                  onClick={() => {
                    navigate(`/titulos/${scanResultTitulo.id}`);
                  }}
                >
                  👁️ Ver Línea de Tiempo y Trazabilidad Completa
                </button>
              </div>
            </div>

            <div className="modal-footer-nav" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-stepper btn-close"
                onClick={() => setIsSmartModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acta oficial en caso de estar entregado */}
      {isActaModalOpen && scanResultTitulo && (
        <GuiaRemisionModal
          isOpen={isActaModalOpen}
          onClose={() => setIsActaModalOpen(false)}
          tituloIndividual={scanResultTitulo}
          tipoTrámite="ENTREGA_GRADUADO"
        />
      )}
    </section>
  );
}
