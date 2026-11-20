import { useState, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Alert, Loading } from '../components/ui';
import { errorMessage, useApi } from '../hooks/useApi';
import type { TituloPublico } from '../api/types';
import QrScannerModal from '../components/QrScannerModal';

export function ConsultaHome() {
  const navigate = useNavigate();
  const { data: est } = useApi<{ titulos_emitidos: number; total_registrados: number; titulos_en_tramite: number }>('/publico/estadisticas');
  const [q, setQ] = useState('');
  const [res, setRes] = useState<TituloPublico[] | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const buscar = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!q.trim() || q.trim().length < 3) {
      setError('Por favor ingrese al menos 3 caracteres para realizar la búsqueda.');
      return;
    }
    setError('');
    setLoadingSearch(true);
    try {
      const response = await api<{ data: TituloPublico[] }>(`/publico/buscar?q=${encodeURIComponent(q.trim())}`);
      setRes(response.data);
    } catch (err) {
      setRes(null);
      setError(errorMessage(err));
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleQrScan = (code: string) => {
    setShowScanner(false);
    // Si el QR contiene una URL con /verificar/, extraer el UUID
    let uuid = code.trim();
    if (uuid.includes('/verificar/')) {
      const parts = uuid.split('/verificar/');
      uuid = parts[parts.length - 1].split('?')[0].split('#')[0];
    }
    if (uuid) {
      navigate(`/verificar/${encodeURIComponent(uuid)}`);
    }
  };

  return (
    <div className="public-portal-wrapper">
      {/* Barra Superior Institucional */}
      <header className="public-top-bar">
        <Link to="/" className="public-brand">
          <div className="public-brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#7a1c1c' }}>
            🎓
          </div>
          <div className="public-brand-text">
            <h1>Universidad Nacional Comandante Padre Gaspar García Laviana</h1>
            <span>Sistema Integrado de Gestión de Títulos Universitarios (SIGTU)</span>
          </div>
        </Link>
        <Link to="/login" className="btn-public-login">
          🔐 Acceso a Funcionarios
        </Link>
      </header>

      {/* Contenido Principal */}
      <main className="public-portal-body">
        {/* Hero Banner */}
        <section className="public-hero-card">
          <div className="public-hero-badge">
            🏛️ Portal Oficial de Cotejo y Validación Ciudadana
          </div>
          <h2 className="public-hero-title">
            Consulta pública de títulos
          </h2>
          <p className="public-hero-desc">
            Consulte y verifique la autenticidad académica y jurídica de títulos universitarios emitidos por la UNCPGGL, conforme al Sistema Oficial SETEC y los estándares del Consejo Nacional de Universidades (CNU).
          </p>
        </section>

        {/* Métricas Institucionales */}
        <section className="public-stats-grid">
          <div className="public-stat-item">
            <div className="public-stat-icon">📜</div>
            <div>
              <div className="public-stat-num">{est ? est.total_registrados : '—'}</div>
              <div className="public-stat-label">Títulos Registrados en el Sistema</div>
            </div>
          </div>
          <div className="public-stat-item">
            <div className="public-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✓</div>
            <div>
              <div className="public-stat-num">{est ? est.titulos_emitidos : '—'}</div>
              <div className="public-stat-label">Títulos Oficialmente Entregados</div>
            </div>
          </div>
          <div className="public-stat-item">
            <div className="public-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>🛡️</div>
            <div>
              <div className="public-stat-num">24 / 7</div>
              <div className="public-stat-label">Validación Segura con Código Criptográfico</div>
            </div>
          </div>
        </section>

        {/* Tarjeta de Búsqueda y Validación */}
        <section className="public-search-card">
          <div className="public-search-tabs">
            <button type="button" className="public-tab-btn active">
              🔍 Búsqueda por Documento o Nombre
            </button>
            <button
              type="button"
              className="public-tab-btn"
              onClick={() => setShowScanner(true)}
              style={{ color: '#b45309' }}
            >
              📷 Escanear Código QR con Cámara
            </button>
          </div>

          <form onSubmit={buscar} className="public-search-form">
            <div className="public-search-input-group">
              <input
                type="text"
                placeholder="Ingrese Cédula (ej. 001-010190-0001A), N.º de Título (ej. TIT-2026-0001) o Nombre..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-public-submit" disabled={loadingSearch}>
                {loadingSearch ? 'Buscando...' : '🔍 Buscar Título'}
              </button>
              <button
                type="button"
                className="btn-public-scan"
                onClick={() => setShowScanner(true)}
                title="Escanear el código QR impreso en el título físico"
              >
                📷 Escanear QR
              </button>
            </div>
          </form>

          <div className="public-search-tips">
            <strong>Consejos de búsqueda:</strong>
            <span>• Puede buscar por número de cédula nicaragüense (con o sin guiones)</span>
            <span>• Por número oficial de título o correlativo (ej. TIT-2026-0001)</span>
            <span>• Por código MINED o nombres completos del graduado</span>
          </div>

          {error && <Alert>{error}</Alert>}

          {/* Resultados de Búsqueda */}
          {res && (
            <div className="public-results-section">
              <div className="public-results-count">
                <span>Resultados encontrados: <b>{res.length}</b></span>
                {res.length > 0 && <small className="muted">Haga clic en una tarjeta para ver la Constancia Oficial</small>}
              </div>

              {res.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#334155' }}>
                    No se encontraron títulos registrados con los datos ingresados: "{q}"
                  </p>
                  <small className="muted">
                    Verifique que el número de cédula o título esté escrito correctamente. Si el trámite es reciente, consulte con la Dirección de Registro Académico.
                  </small>
                </div>
              ) : (
                res.map((t) => (
                  <div key={t.uuid} className="public-card-result">
                    <div className="public-result-info">
                      <h3 className="public-result-title">{t.titulo_obtenido || t.carrera}</h3>
                      <div className="public-result-name">
                        👤 <b>{t.graduado || 'Graduado Registrado'}</b>
                      </div>
                      <div className="public-result-meta">
                        {t.cedula_enmascarada && <span><b>Cédula:</b> {t.cedula_enmascarada}</span>}
                        <span><b>N.º Registro:</b> {t.numero_titulo}</span>
                        <span><b>Sede:</b> {t.sede || 'León'}</span>
                        {t.fecha_emision_titulo && <span><b>Emisión:</b> {t.fecha_emision_titulo}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                      <span
                        className="badge"
                        style={{
                          background: t.estado === 'ENTREGADO' ? '#dcfce7' : '#fef3c7',
                          color: t.estado === 'ENTREGADO' ? '#14532d' : '#78350f',
                          border: t.estado === 'ENTREGADO' ? '1px solid #86efac' : '1px solid #fde68a',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.65rem',
                        }}
                      >
                        {t.estado === 'ENTREGADO' ? '✓ Título Emitido y Vigente' : '⏳ En Proceso de Emisión'}
                      </span>
                      <Link to={`/verificar/${t.uuid}`} className="btn-view-certificate">
                        📜 Ver Certificado Oficial →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      {/* Pie de Página Institucional */}
      <footer className="public-portal-footer">
        <p style={{ margin: '0 0 0.3rem 0', fontWeight: 600 }}>
          Universidad Nacional Comandante Padre Gaspar García Laviana — Secretaría General · Dirección de Registro y Titulación
        </p>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Portal Oficial de Verificación amparado bajo la Ley de Reconocimiento y Registro de Títulos de la República de Nicaragua. Los datos expuestos cumplen con las normas de minimización y protección de la privacidad (ISO 27001).
        </p>
      </footer>

      {/* Modal de Escáner QR con Cámara */}
      <QrScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQrScan}
        title="Escanear Código QR del Título Universitario"
      />
    </div>
  );
}

export function Verificar() {
  const { uuid } = useParams();
  const { data, error, loading } = useApi<{ data: TituloPublico }>(`/publico/verificar/${encodeURIComponent(uuid || '')}`);

  if (loading) {
    return (
      <div className="public-portal-wrapper">
        <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <Loading />
          <p className="muted" style={{ marginTop: '1rem' }}>Verificando autenticidad en el libro oficial de registros...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="public-portal-wrapper">
        <header className="public-top-bar">
          <Link to="/" className="public-brand">
            <span style={{ fontSize: '1.4rem' }}>🎓</span>
            <div className="public-brand-text">
              <h1>Universidad Nacional Comandante Padre Gaspar García Laviana</h1>
              <span>Sistema Integrado de Gestión de Títulos Universitarios</span>
            </div>
          </Link>
        </header>
        <main className="public-portal-body">
          <div className="public-search-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <span style={{ fontSize: '3rem' }}>⚠️</span>
            <h2 style={{ color: '#b91c1c', margin: '0.8rem 0 0.4rem 0' }}>Título No Localizado en el Registro Oficial</h2>
            <p className="muted" style={{ maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              El código o identificador solicitado no coincide con ningún título registrado o emitido en el sistema. Asegúrese de que el código QR o enlace sea legítimo.
            </p>
            <div>
              <Link to="/" className="btn-public-submit" style={{ textDecoration: 'none' }}>
                ← Regresar a la Consulta Pública
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const t = data.data;
  const esVigente = t.estado === 'ENTREGADO';
  const urlVerificacion = window.location.href;

  return (
    <div className="public-portal-wrapper">
      {/* Barra Superior */}
      <header className="public-top-bar">
        <Link to="/" className="public-brand">
          <span style={{ fontSize: '1.4rem' }}>🎓</span>
          <div className="public-brand-text">
            <h1>Universidad Nacional Comandante Padre Gaspar García Laviana</h1>
            <span>Sistema Integrado de Gestión de Títulos Universitarios</span>
          </div>
        </Link>
        <Link to="/login" className="btn-public-login">
          🔐 Acceso a Funcionarios
        </Link>
      </header>

      {/* Cuerpo del Certificado */}
      <main className="public-portal-body">
        <div className="certificate-view-container">
          {/* Barra de Acciones */}
          <div className="certificate-actions-bar">
            <Link to="/" className="btn-back-public">
              ← Realizar otra consulta
            </Link>
            <button
              type="button"
              className="btn-print-certificate"
              onClick={() => window.print()}
            >
              🖨️ Imprimir Constancia Oficial
            </button>
          </div>

          {/* Hoja de Certificación Oficial */}
          <div className="official-certificate-sheet">
            <div className="cert-header">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>🏛️</div>
              <h2>UNIVERSIDAD NACIONAL COMANDANTE PADRE GASPAR GARCÍA LAVIANA</h2>
              <h3>República de Nicaragua · Consejo Nacional de Universidades (CNU)</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Secretaría General · Dirección de Registro y Titulación Universitaria
              </p>
            </div>

            <div className="cert-title-banner">
              <h1>CONSTANCIA OFICIAL DE VALIDACIÓN DE TÍTULO</h1>
            </div>

            <div className="cert-status-badge-row">
              <div className={`cert-status-badge ${esVigente ? 'vigente' : 'en_proceso'}`}>
                <span>{esVigente ? '🛡️' : '⏳'}</span>
                <span>{t.estado_label || (esVigente ? 'Título Emitido y Vigente' : 'En Trámite de Emisión')}</span>
              </div>
            </div>

            <table className="cert-table-data">
              <tbody>
                <tr>
                  <th>Nombre del Titulado(a):</th>
                  <td style={{ fontWeight: 800, fontSize: '0.98rem', color: '#7a1c1c' }}>
                    {t.graduado}
                  </td>
                </tr>
                {t.cedula_enmascarada && (
                  <tr>
                    <th>Documento de Identidad:</th>
                    <td><b>{t.cedula_enmascarada}</b> <small className="muted">(Cédula Nicaragüense Verificada)</small></td>
                  </tr>
                )}
                <tr>
                  <th>Título Otorgado:</th>
                  <td style={{ fontWeight: 700 }}>{t.titulo_obtenido || t.carrera}</td>
                </tr>
                <tr>
                  <th>Carrera / Especialidad:</th>
                  <td>{t.carrera}</td>
                </tr>
                <tr>
                  <th>Sede Universitaria:</th>
                  <td>{t.sede || 'Sede Central - León'}</td>
                </tr>
                <tr>
                  <th>Número de Título / Registro:</th>
                  <td><b>{t.numero_titulo}</b></td>
                </tr>
                <tr>
                  <th>Tomo y Folio:</th>
                  <td>Tomo: <b>{t.tomo || 'I'}</b> | Folio: <b>{t.folio || '—'}</b></td>
                </tr>
                <tr>
                  <th>Fecha de Emisión del Título:</th>
                  <td>{t.fecha_emision_titulo || '—'}</td>
                </tr>
                {t.fecha_registro_setec && (
                  <tr>
                    <th>Fecha de Registro SETEC:</th>
                    <td>{t.fecha_registro_setec}</td>
                  </tr>
                )}
                <tr>
                  <th>Estado del Trámite:</th>
                  <td>
                    {esVigente ? (
                      <span style={{ color: '#15803d', fontWeight: 700 }}>
                        ENTREGADO AL TITULADO — VIGENCIA PLENA
                      </span>
                    ) : (
                      <span style={{ color: '#b45309', fontWeight: 700 }}>
                        EXPEDIENTE APROBADO EN TRÁMITE ({t.ubicacion_actual || 'EN PROCESO'})
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Sello y Bloque de Seguridad Digital */}
            <div className="cert-footer-security">
              <div className="cert-security-info">
                <div><strong>Código de Seguridad Criptográfico:</strong> <code>{t.sello_seguridad || 'UNCPGGL-OFFICIAL'}</code></div>
                <div><strong>Identificador Único (UUID):</strong> <code>{t.uuid}</code></div>
                <div><strong>Fecha y Hora de Cotejo:</strong> {t.fecha_consulta || new Date().toLocaleString()}</div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#64748b', lineHeight: 1.3 }}>
                  La presente constancia electrónica certifica la correspondencia de los datos con el Libro Oficial de Títulos de la Universidad Nacional Comandante Padre Gaspar García Laviana, amparada por la normativa nacional del CNU.
                </div>
              </div>

              <div className="cert-qr-box">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(urlVerificacion)}`}
                  alt="Código QR de Verificación"
                  style={{ width: '100px', height: '100px', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px', background: '#fff' }}
                />
                <small style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Cotejo QR Oficial</small>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="public-portal-footer">
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Universidad Nacional Comandante Padre Gaspar García Laviana · Dirección de Registro y Titulación
        </p>
      </footer>
    </div>
  );
}
