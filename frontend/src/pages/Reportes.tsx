import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert, Badge, Loading, fecha } from '../components/ui';
import type { Proceso, Titulacion, TituloFisico } from '../api/types';

interface LoteReporteItem {
  id: number;
  tipo: 'IMPRENTA' | 'SETEC';
  numero_lote: string;
  fecha_envio?: string;
  fecha_retorno?: string;
  total_titulos: number;
  estado: string;
  responsable_envio?: string;
  responsable_recepcion?: string;
  observaciones?: string;
}

interface IncidenciaItem {
  id: number;
  lote?: string;
  numero_titulo?: string;
  graduado?: string;
  cedula?: string;
  carrera?: string;
  estado: string;
  observacion?: string;
  fecha_dictamen?: string;
}

interface ReporteResponse {
  tipo: string;
  tipos: Record<string, string>;
  carreras: string[];
  generado_el: string;
  padron?: Titulacion[];
  libro?: TituloFisico[];
  lotes?: LoteReporteItem[];
  procesos?: Proceso[];
  incidencias?: IncidenciaItem[];
  titulos?: TituloFisico[];
}

export default function Reportes() {
  const [tipo, setTipo] = useState('padron_graduados');
  const [carrera, setCarrera] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [search, setSearch] = useState('');

  const [data, setData] = useState<ReporteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReporte = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ tipo });
      if (carrera && carrera !== 'todas') params.append('carrera', carrera);
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);
      if (search.trim()) params.append('q', search.trim());

      const res = await api<ReporteResponse>(`/reportes?${params.toString()}`);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [tipo]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cargarReporte();
  };

  const handleResetFilters = () => {
    setCarrera('');
    setDesde('');
    setHasta('');
    setSearch('');
    setTimeout(cargarReporte, 50);
  };

  // Exportar la tabla visible directamente a CSV (Excel)
  const exportarCSV = () => {
    if (!data) return;

    let rows: string[][] = [];
    let headers: string[] = [];
    let filename = `reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (tipo === 'padron_graduados' && data.padron) {
      headers = ['#', 'Graduado', 'Cedula/Carnet', 'Sexo', 'Carrera', 'Titulo Obtenido', 'Fecha Titulacion', 'Libro/Tomo/Folio'];
      rows = data.padron.map((t, idx) => [
        (idx + 1).toString(),
        `"${t.graduado?.nombre_completo || ''}"`,
        `"${t.graduado?.cedula || t.graduado?.carnet || ''}"`,
        `"${t.graduado?.sexo || 'Sin especificar'}"`,
        `"${t.carrera || ''}"`,
        `"${t.titulo_obtenido || ''}"`,
        `"${t.fecha_titulacion || ''}"`,
        `"${[
          (t.titulo_fisico ?? t.tituloFisico)?.libro,
          (t.titulo_fisico ?? t.tituloFisico)?.tomo,
          (t.titulo_fisico ?? t.tituloFisico)?.folio,
        ].filter(Boolean).join('/')}"`,
      ]);
    } else if (tipo === 'libro_registro' && data.libro) {
      headers = ['#', 'N.º Titulo', 'Tomo', 'Folio', 'Libro', 'Graduado', 'Cedula', 'Carrera', 'Ubicacion Actual'];
      rows = data.libro.map((t, idx) => [
        (idx + 1).toString(),
        `"${t.numero_titulo || ''}"`,
        `"${t.tomo || ''}"`,
        `"${t.folio || ''}"`,
        `"${t.libro || ''}"`,
        `"${t.titulacion?.graduado?.nombre_completo || ''}"`,
        `"${t.titulacion?.graduado?.cedula || ''}"`,
        `"${t.titulacion?.carrera || ''}"`,
        `"${t.ubicacion_actual || ''}"`,
      ]);
    } else if (tipo === 'custodia_lotes' && data.lotes) {
      headers = ['#', 'Tipo Lote', 'Numero Lote', 'Fecha Envio', 'Fecha Retorno', 'Total Titulos', 'Estado', 'Responsable Envio', 'Responsable Recepcion'];
      rows = data.lotes.map((l, idx) => [
        (idx + 1).toString(),
        `"${l.tipo}"`,
        `"${l.numero_lote}"`,
        `"${l.fecha_envio || ''}"`,
        `"${l.fecha_retorno || ''}"`,
        l.total_titulos.toString(),
        `"${l.estado}"`,
        `"${l.responsable_envio || ''}"`,
        `"${l.responsable_recepcion || ''}"`,
      ]);
    } else if ((tipo === 'auditoria_sla' || tipo === 'sla_vencido') && data.procesos) {
      headers = ['#', 'Graduado', 'Cedula', 'Carrera', 'Inicio SLA', 'Limite SLA', 'Dias Restantes', 'Estado SLA'];
      rows = data.procesos.map((p, idx) => [
        (idx + 1).toString(),
        `"${p.titulacion?.graduado?.nombre_completo || ''}"`,
        `"${p.titulacion?.graduado?.cedula || ''}"`,
        `"${p.titulacion?.carrera || ''}"`,
        `"${p.fecha_inicio_sla || ''}"`,
        `"${p.fecha_limite_sla || ''}"`,
        (p.dias_restantes ?? 0).toString(),
        `"${p.finalizado ? 'Entregado' : p.sla_vencido ? 'Vencido' : 'En tiempo'}"`,
      ]);
    } else if (tipo === 'incidencias_setec' && data.incidencias) {
      headers = ['#', 'Lote', 'Numero Titulo', 'Graduado', 'Cedula', 'Carrera', 'Dictamen SETEC', 'Observacion', 'Fecha'];
      rows = data.incidencias.map((i, idx) => [
        (idx + 1).toString(),
        `"${i.lote || ''}"`,
        `"${i.numero_titulo || ''}"`,
        `"${i.graduado || ''}"`,
        `"${i.cedula || ''}"`,
        `"${i.carrera || ''}"`,
        `"${i.estado || ''}"`,
        `"${i.observacion || ''}"`,
        `"${i.fecha_dictamen || ''}"`,
      ]);
    } else if (data.titulos) {
      headers = ['#', 'N.º Titulo', 'Graduado', 'Cedula', 'Carrera', 'Ubicacion'];
      rows = data.titulos.map((t, idx) => [
        (idx + 1).toString(),
        `"${t.numero_titulo}"`,
        `"${t.titulacion?.graduado?.nombre_completo || ''}"`,
        `"${t.titulacion?.graduado?.cedula || ''}"`,
        `"${t.titulacion?.carrera || ''}"`,
        `"${t.ubicacion_actual}"`,
      ]);
    }

    if (rows.length === 0) {
      alert('No hay registros para exportar en el reporte actual.');
      return;
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Métricas estadísticas para la cabecera del reporte
  const totalRegistros =
    data?.padron?.length ??
    data?.libro?.length ??
    data?.lotes?.length ??
    data?.procesos?.length ??
    data?.incidencias?.length ??
    data?.titulos?.length ??
    0;

  const totalMujeres =
    data?.padron?.filter((t) => t.graduado?.sexo?.toLowerCase() === 'femenino').length ?? 0;
  const totalHombres =
    data?.padron?.filter((t) => t.graduado?.sexo?.toLowerCase() === 'masculino').length ?? 0;

  return (
    <section>
      {/* Cabecera de Pantalla (No imprimible) */}
      <div className="toolbar no-print" style={{ marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            📑 Reportes Institucionales y Auditoría
            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              (UNCPGGL · Secretaría General y Registro)
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-stepper btn-save"
            style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={exportarCSV}
            title="Descargar datos en formato Excel / CSV"
          >
            📥 Exportar Excel (CSV)
          </button>
          <button
            type="button"
            className="btn-search"
            style={{ background: 'var(--primary)', color: '#fff', minHeight: '34px', fontSize: '0.82rem', padding: '0 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => window.print()}
            title="Imprimir reporte membretado o guardar en PDF"
          >
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Selector de Tipo de Reporte (Píldoras y Select) */}
      <div className="no-print" style={{
        background: '#fff',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.8rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <label htmlFor="tipo-reporte-select" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>
            Tipo de Reporte:
          </label>
          <select
            id="tipo-reporte-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ fontWeight: 600, fontSize: '0.86rem', minWidth: '320px' }}
          >
            {data?.tipos &&
              Object.entries(data.tipos).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
          </select>
        </div>

        {/* Filtros Secundarios: Carrera, Rango de Fechas y Búsqueda */}
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {data?.carreras && data.carreras.length > 0 && (
            <select
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              style={{ fontSize: '0.82rem', minWidth: '180px' }}
            >
              <option value="">Todas las Carreras</option>
              {data.carreras.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
            />
          </div>

          <input
            type="text"
            placeholder="Buscar por cédula, nombre o título…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '160px', fontSize: '0.82rem' }}
          />

          <button type="submit" className="btn-search" style={{ minHeight: '34px', fontSize: '0.82rem' }}>
            Filtrar
          </button>
          {(carrera || desde || hasta || search) && (
            <button
              type="button"
              className="btn-stepper btn-close"
              style={{ minHeight: '34px', fontSize: '0.82rem' }}
              onClick={handleResetFilters}
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* KPI Cards de Resumen Estadístico (Pasa a la vista impresa) */}
      <div className="kpis-grid no-print" style={{ marginBottom: '1.2rem' }}>
        <div className="kpi-card" style={{ borderLeftColor: 'var(--primary)' }}>
          <div className="kpi-icon">📊</div>
          <div className="kpi-body">
            <span className="kpi-label">Total en este Reporte</span>
            <b className="kpi-value">{totalRegistros}</b>
            <span className="kpi-subtext">Registros encontrados</span>
          </div>
        </div>

        {tipo === 'padron_graduados' && (
          <>
            <div className="kpi-card kpi-orange">
              <div className="kpi-icon">👩‍🎓</div>
              <div className="kpi-body">
                <span className="kpi-label">Graduadas (Mujeres)</span>
                <b className="kpi-value">{totalMujeres}</b>
                <span className="kpi-subtext">
                  {totalRegistros > 0 ? `${Math.round((totalMujeres / totalRegistros) * 100)}% del total` : '0%'}
                </span>
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeftColor: '#0284c7' }}>
              <div className="kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>👨‍🎓</div>
              <div className="kpi-body">
                <span className="kpi-label">Graduados (Varones)</span>
                <b className="kpi-value" style={{ color: '#0284c7' }}>{totalHombres}</b>
                <span className="kpi-subtext">
                  {totalRegistros > 0 ? `${Math.round((totalHombres / totalRegistros) * 100)}% del total` : '0%'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {/* ÁREA IMPRIMIBLE DEL REPORTE */}
      <div className="print-area" style={{ background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '1.2rem' }}>
        {/* Encabezado Oficial UNCPGGL para Impresión / PDF */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--primary)',
          paddingBottom: '0.8rem',
          marginBottom: '1rem',
        }}>
          <img
            src="/logo-uncpggl.png"
            alt="Escudo UNCPGGL"
            style={{ height: '65px', width: 'auto' }}
          />
          <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800 }}>
              UNIVERSIDAD NACIONAL PADRE GASPAR GARCÍA LAVIANA
            </h2>
            <div style={{ fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--gold-text)', fontWeight: 600 }}>
              ¡Fe y Amor por mi pueblo nicaragüense!
            </div>
            <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
              Dirección General de Registro y Control Académico · Sistema SIGTU
            </div>
            <div style={{
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#111',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}>
              {data?.tipos[tipo] || 'Reporte Institucional'}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-muted)', minWidth: '120px' }}>
            <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-NI')}</div>
            <div><strong>Hora:</strong> {new Date().toLocaleTimeString('es-NI')}</div>
            <div><strong>Total:</strong> {totalRegistros} reg.</div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : totalRegistros === 0 ? (
          <div className="info-select-graduado">
            No se encontraron registros para los criterios y filtros especificados.
          </div>
        ) : (
          <>
            {/* TABLA 1: Padrón Oficial de Graduados */}
            {tipo === 'padron_graduados' && data?.padron && (
              <div className="table-wrapper">
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th>Graduado / Cédula</th>
                      <th style={{ textAlign: 'center' }}>Sexo</th>
                      <th>Carrera</th>
                      <th>Título Obtenido</th>
                      <th>Fecha Titulación</th>
                      <th>Lib/Tom/Fol</th>
                      <th style={{ textAlign: 'center' }}>Estado Físico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.padron.map((t, idx) => (
                      <tr key={t.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div><strong>{t.graduado?.nombre_completo}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {t.graduado?.cedula || t.graduado?.carnet || 'Sin doc'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{t.graduado?.sexo || '—'}</td>
                        <td>{t.carrera}</td>
                        <td>{t.titulo_obtenido || '—'}</td>
                        <td>{fecha(t.fecha_titulacion)}</td>
                        <td>
                          {[
                            (t.titulo_fisico ?? t.tituloFisico)?.libro,
                            (t.titulo_fisico ?? t.tituloFisico)?.tomo,
                            (t.titulo_fisico ?? t.tituloFisico)?.folio,
                          ].filter(Boolean).join('/') || '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge value={(t.titulo_fisico ?? t.tituloFisico)?.ubicacion_actual || 'LEON'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA 2: Libro Oficial de Registro (Tomo y Folio) */}
            {tipo === 'libro_registro' && data?.libro && (
              <div className="table-wrapper">
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th>N.º Título</th>
                      <th style={{ textAlign: 'center' }}>Tomo</th>
                      <th style={{ textAlign: 'center' }}>Folio</th>
                      <th style={{ textAlign: 'center' }}>Libro</th>
                      <th>Graduado / Cédula</th>
                      <th>Carrera</th>
                      <th style={{ textAlign: 'center' }}>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.libro.map((t, idx) => (
                      <tr key={t.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.numero_titulo}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{t.tomo || '—'}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{t.folio || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{t.libro || '—'}</td>
                        <td>
                          <div><strong>{t.titulacion?.graduado?.nombre_completo}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {t.titulacion?.graduado?.cedula || 'Sin cédula'}
                          </div>
                        </td>
                        <td>{t.titulacion?.carrera}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge value={t.ubicacion_actual} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA 3: Histórico de Custodia y Lotes */}
            {tipo === 'custodia_lotes' && data?.lotes && (
              <div className="table-wrapper">
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th>Tipo</th>
                      <th>N.º Lote</th>
                      <th>Fecha Envío</th>
                      <th>Fecha Retorno</th>
                      <th style={{ textAlign: 'center' }}>Total Títulos</th>
                      <th>Responsable Envío</th>
                      <th>Responsable Recepción</th>
                      <th style={{ textAlign: 'center' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lotes.map((l, idx) => (
                      <tr key={l.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <span className={`badge ${l.tipo === 'IMPRENTA' ? 'orange' : 'purple'}`}>
                            {l.tipo}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{l.numero_lote}</td>
                        <td>{fecha(l.fecha_envio)}</td>
                        <td>{fecha(l.fecha_retorno)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{l.total_titulos}</td>
                        <td>{l.responsable_envio || '—'}</td>
                        <td>{l.responsable_recepcion || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge value={l.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA 4: Auditoría de SLA (45 Días) */}
            {(tipo === 'auditoria_sla' || tipo === 'sla_vencido') && data?.procesos && (
              <div className="table-wrapper">
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th>Graduado / Cédula</th>
                      <th>Carrera</th>
                      <th>Inicio SLA</th>
                      <th>Límite SLA</th>
                      <th style={{ textAlign: 'center' }}>Días Restantes</th>
                      <th style={{ textAlign: 'center' }}>Estado SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.procesos.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div><strong>{p.titulacion?.graduado?.nombre_completo}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {p.titulacion?.graduado?.cedula || 'Sin cédula'}
                          </div>
                        </td>
                        <td>{p.titulacion?.carrera}</td>
                        <td>{fecha(p.fecha_inicio_sla)}</td>
                        <td>{fecha(p.fecha_limite_sla)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {p.finalizado ? '—' : p.dias_restantes ?? 0}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {p.finalizado ? (
                            <span className="badge green">✓ Entregado</span>
                          ) : p.sla_vencido ? (
                            <span className="badge red">🚨 Vencido</span>
                          ) : (
                            <span className={`badge ${(p.dias_restantes ?? 45) <= 10 ? 'orange' : 'green'}`}>
                              ⏱️ En tiempo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA 5: Incidencias y Observaciones SETEC */}
            {tipo === 'incidencias_setec' && data?.incidencias && (
              <div className="table-wrapper">
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th>N.º Lote</th>
                      <th>N.º Título</th>
                      <th>Graduado / Cédula</th>
                      <th>Carrera</th>
                      <th style={{ textAlign: 'center' }}>Dictamen</th>
                      <th>Motivo de Observación</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.incidencias.map((i, idx) => (
                      <tr key={i.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td><strong>{i.lote || '—'}</strong></td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{i.numero_titulo || '—'}</td>
                        <td>
                          <div><strong>{i.graduado}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{i.cedula}</div>
                        </td>
                        <td>{i.carrera}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${i.estado === 'OBSERVADO' ? 'orange' : 'red'}`}>
                            {i.estado}
                          </span>
                        </td>
                        <td style={{ color: '#b91c1c' }}>{i.observacion || 'Sin motivo especificado'}</td>
                        <td>{fecha(i.fecha_dictamen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA POR DEFECTO: Títulos por Ubicación */}
            {data?.titulos && (
              <div className="table-wrapper">
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th>N.º Título</th>
                      <th>Graduado</th>
                      <th>Cédula</th>
                      <th>Carrera</th>
                      <th style={{ textAlign: 'center' }}>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.titulos.map((t, idx) => (
                      <tr key={t.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{t.numero_titulo}</td>
                        <td>{t.titulacion?.graduado?.nombre_completo}</td>
                        <td>{t.titulacion?.graduado?.cedula || '—'}</td>
                        <td>{t.titulacion?.carrera}</td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge value={t.ubicacion_actual} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Sección de Firmas Oficiales para la Hoja Impresa */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          marginTop: '3.5rem',
          paddingTop: '1rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #111', height: '45px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111' }}>
              ELABORADO POR (RESPONSABLE DE REGISTRO)
            </div>
            <div style={{ fontSize: '0.74rem', color: '#4b5563' }}>Firma, Cédula y Sello</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #111', height: '45px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111' }}>
              VISTO BUENO (SECRETARÍA GENERAL UNCPGGL)
            </div>
            <div style={{ fontSize: '0.74rem', color: '#4b5563' }}>Firma, Cédula y Sello Oficial</div>
          </div>
        </div>
      </div>
    </section>
  );
}
