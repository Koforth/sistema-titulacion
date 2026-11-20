import { useState, useEffect } from 'react';
import { api, type Page } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, Loading, Pager } from '../components/ui';
import type { TituloFisico } from '../api/types';
import QrScannerModal from '../components/QrScannerModal';
import GuiaRemisionModal from '../components/GuiaRemisionModal';

export default function Entrega() {
  const { can } = useAuth();
  const [titulos, setTitulos] = useState<Page<TituloFisico>>({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isActaOpen, setIsActaOpen] = useState(false);
  const [tituloEntregado, setTituloEntregado] = useState<TituloFisico | null>(null);

  const cargarTitulos = async (page = 1, query = '') => {
    setLoading(true);
    setError(null);
    try {
      const q = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
      const data = await api<Page<TituloFisico>>(`/entrega?page=${page}${q}`);
      setTitulos(data);
      setCurrentPage(data.current_page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar títulos para entrega');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTitulos(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    cargarTitulos(1, searchQuery);
  };

  // Escaneo con teléfono móvil
  const handleScanCode = (code: string) => {
    setSearchQuery(code);
    cargarTitulos(1, code);
  };

  const entregar = async (t: TituloFisico) => {
    const graduadoNombre = t.titulacion?.graduado?.nombre_completo || 'el graduado';
    if (!confirm(`¿Confirmar entrega física del título ${t.numero_titulo} a ${graduadoNombre}? Esta acción cerrará formalmente el expediente.`)) {
      return;
    }

    try {
      const entregado = await api<TituloFisico>(`/entrega/${t.id}`, { method: 'POST', body: {} });
      setMsg({ kind: 'success', text: `Título ${t.numero_titulo} entregado formalmente a ${graduadoNombre}.` });
      setTituloEntregado(entregado);
      setIsActaOpen(true);
      cargarTitulos(currentPage, searchQuery);
    } catch (err: unknown) {
      setMsg({ kind: 'error', text: err instanceof Error ? err.message : 'Error al entregar el título' });
    }
  };

  return (
    <section>
      <div className="toolbar" style={{ marginBottom: '1.2rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            🎓 Ventanilla de Entrega de Títulos
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (Recepción y Firma del Graduado)
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-search"
            style={{ background: 'var(--gold)', color: '#2b1d00', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setIsScannerOpen(true)}
          >
            📱 Escanear con Teléfono Móvil
          </button>
        </div>
      </div>

      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      {/* Buscador de graduado o título */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <input
          type="text"
          placeholder="Buscar por cédula, carnet, nombre de graduado o N.º de título…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-search">
          Buscar
        </button>
        {searchQuery && (
          <button
            type="button"
            className="btn-stepper btn-close"
            onClick={() => { setSearchQuery(''); cargarTitulos(1, ''); }}
          >
            Limpiar
          </button>
        )}
      </form>

      {loading ? (
        <Loading />
      ) : titulos.data.length === 0 ? (
        <div className="info-select-graduado">
          No se encontraron títulos listos para entrega {searchQuery ? `con el criterio "${searchQuery}"` : 'en este momento'}.
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
                  <th style={{ textAlign: 'center' }}>Ubicación</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {titulos.data.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {t.numero_titulo}
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
                      {can('admin', 'operador') && (
                        <button
                          type="button"
                          className="btn-stepper btn-save"
                          style={{ minHeight: '30px', fontSize: '0.8rem', padding: '0 0.8rem' }}
                          onClick={() => entregar(t)}
                        >
                          ✓ Entregar Título
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pager page={titulos} onChange={(p) => setCurrentPage(p)} />
        </>
      )}

      {/* Escáner Móvil */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanCode}
        title="Escanear QR de Cédula o Título"
      />

      {/* Acta Oficial de Entrega Imprimible */}
      <GuiaRemisionModal
        isOpen={isActaOpen}
        onClose={() => setIsActaOpen(false)}
        tituloIndividual={tituloEntregado}
        tipoTrámite="ENTREGA_GRADUADO"
      />
    </section>
  );
}
