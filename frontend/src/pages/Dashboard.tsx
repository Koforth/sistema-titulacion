import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Dashboard as DashboardType } from '../api/types';
import { useApi } from '../hooks/useApi';
import { Alert, Badge, Loading } from '../components/ui';

export default function Dashboard() {
  const { data, error, loading, reload } = useApi<DashboardType>('/dashboard');
  const [segundosActualizacion, setSegundosActualizacion] = useState(10);
  const [ultimaHora, setUltimaHora] = useState<string>('');

  // Polling en tiempo real cada 10 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setSegundosActualizacion((prev) => {
        if (prev <= 1) {
          reload();
          setUltimaHora(new Date().toLocaleTimeString('es'));
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [reload]);

  useEffect(() => {
    if (data) {
      setUltimaHora(new Date().toLocaleTimeString('es'));
    }
  }, [data]);

  if (loading && !data) return <Loading />;
  if (error || !data) return <Alert>{error ?? 'Sin datos disponibles'}</Alert>;

  // Cálculo para Gráfico 1: Títulos por Ubicación (Donut SVG)
  const ubicaciones = data.graficos?.ubicaciones ?? [];
  const totalUbicaciones = ubicaciones.reduce((acc, curr) => acc + curr.value, 0);

  // Cálculo para Gráfico 2: Top Carreras (Barras horizontales normalizadas)
  const carreras = data.graficos?.carreras ?? [];
  const maxCarrera = Math.max(...carreras.map((c) => c.value), 1);

  // Cálculo para Gráfico 3: Pipeline / Embudo de Procesos
  const flujo = data.graficos?.flujo_procesos ?? [];
  const maxFlujo = Math.max(...flujo.map((f) => f.total), 1);

  // Generador de segmentos SVG para Gráfico Donut
  let acumulado = 0;
  const segmentosDonut = ubicaciones.map((item) => {
    const porcentaje = totalUbicaciones > 0 ? (item.value / totalUbicaciones) * 100 : 0;
    const dasharray = `${porcentaje} ${100 - porcentaje}`;
    const dashoffset = 100 - acumulado + 25; // Inicia arriba
    acumulado += porcentaje;
    return { ...item, porcentaje: Math.round(porcentaje), dasharray, dashoffset };
  });

  return (
    <section className="dashboard-view" aria-labelledby="dashboard-title">
      <div className="dashboard-topbar">
        <div>
          <h1 id="dashboard-title">Dashboard Operativo</h1>
          <p className="muted" style={{ margin: 0 }}>
            Monitoreo en tiempo real del ciclo de vida y emisión de títulos
          </p>
        </div>
        <div className="live-indicator">
          <span className="pulse-dot" aria-hidden="true"></span>
          <span className="live-text">
            En vivo · Siguiente actualización en <b>{segundosActualizacion}s</b>
          </span>
          {ultimaHora && <small className="muted">({ultimaHora})</small>}
          <button type="button" className="refresh-btn" onClick={() => reload()} title="Actualizar ahora">
            ↻
          </button>
        </div>
      </div>

      {/* === 4 KPIS PRINCIPALES === */}
      <div className="kpis-grid" role="region" aria-label="Indicadores Clave de Rendimiento">
        {data.kpis && (
          <>
            <div className={`kpi-card kpi-${data.kpis.total_titulos.color}`}>
              <div className="kpi-icon">🎓</div>
              <div className="kpi-body">
                <span className="kpi-label">{data.kpis.total_titulos.label}</span>
                <b className="kpi-value">{data.kpis.total_titulos.valor}</b>
                <span className="kpi-subtext">{data.kpis.total_titulos.subtext}</span>
              </div>
            </div>

            <div className={`kpi-card kpi-${data.kpis.en_proceso.color}`}>
              <div className="kpi-icon">⏳</div>
              <div className="kpi-body">
                <span className="kpi-label">{data.kpis.en_proceso.label}</span>
                <b className="kpi-value">{data.kpis.en_proceso.valor}</b>
                <span className="kpi-subtext">{data.kpis.en_proceso.subtext}</span>
              </div>
            </div>

            <div className={`kpi-card kpi-${data.kpis.entregados.color}`}>
              <div className="kpi-icon">✅</div>
              <div className="kpi-body">
                <span className="kpi-label">{data.kpis.entregados.label}</span>
                <b className="kpi-value">{data.kpis.entregados.valor}</b>
                <span className="kpi-subtext">{data.kpis.entregados.subtext}</span>
              </div>
            </div>

            <div className={`kpi-card kpi-${data.kpis.sla_vencido.color}`}>
              <div className="kpi-icon">⚠️</div>
              <div className="kpi-body">
                <span className="kpi-label">{data.kpis.sla_vencido.label}</span>
                <b className="kpi-value">{data.kpis.sla_vencido.valor}</b>
                <span className="kpi-subtext">{data.kpis.sla_vencido.subtext}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* === 3 GRÁFICOS EN TIEMPO REAL === */}
      <div className="charts-grid" role="region" aria-label="Gráficos de Distribución en Tiempo Real">
        {/* Gráfico 1: Ubicación Física de Títulos (Donut Chart SVG) */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Distribución por Ubicación</h3>
            <span className="muted">Total: {totalUbicaciones}</span>
          </div>
          <div className="chart-donut-container">
            <svg viewBox="0 0 42 42" className="donut-svg" aria-label="Gráfico circular de ubicaciones">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              {totalUbicaciones === 0 ? (
                <text x="21" y="22" textAnchor="middle" fontSize="3" fill="#94a3b8">
                  Sin datos
                </text>
              ) : (
                segmentosDonut.map((s, idx) => (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth="6"
                    strokeDasharray={s.dasharray}
                    strokeDashoffset={s.dashoffset}
                  />
                ))
              )}
            </svg>
            <div className="donut-legend">
              {ubicaciones.map((u, i) => (
                <div key={i} className="legend-row">
                  <span className="legend-dot" style={{ backgroundColor: u.color }}></span>
                  <span className="legend-name">{u.name}</span>
                  <b className="legend-val">{u.value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico 2: Titulaciones por Carrera (Barras Horizontales) */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Carreras con Titulación</h3>
            <span className="muted">Demandas académicas</span>
          </div>
          <div className="chart-bars-container">
            {carreras.length === 0 ? (
              <p className="muted">No hay registros de carreras aún.</p>
            ) : (
              carreras.map((c, i) => {
                const porcentaje = Math.round((c.value / maxCarrera) * 100);
                return (
                  <div key={i} className="bar-item">
                    <div className="bar-labels">
                      <span className="bar-title" title={c.name}>{c.name}</span>
                      <span className="bar-count">{c.value}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico 3: Flujo de Procesos y Etapas (Pipeline) */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Embudo del Flujo Administrativo</h3>
            <span className="muted">Etapas completadas</span>
          </div>
          <div className="chart-funnel-container">
            {flujo.length === 0 ? (
              <p className="muted">Sin procesos activos.</p>
            ) : (
              flujo.map((f, i) => {
                const porcentaje = Math.round((f.total / maxFlujo) * 100);
                return (
                  <div key={i} className="funnel-step">
                    <div className="funnel-info">
                      <span className="funnel-num">{i + 1}</span>
                      <span className="funnel-name">{f.etapa}</span>
                      <b className="funnel-total">{f.total}</b>
                    </div>
                    <div className="funnel-bar-bg">
                      <div
                        className="funnel-bar-fill"
                        style={{ width: `${Math.max(porcentaje, 6)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* === TABLA DE ACTIVIDAD RECIENTE === */}
      <div className="recent-activity-section">
        <h2>Últimos títulos físicos ingresados</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>N.º Título</th>
                <th>Graduado</th>
                <th>Carrera</th>
                <th>Ubicación Actual</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimos_titulos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    No hay títulos físicos registrados aún.
                  </td>
                </tr>
              ) : (
                data.ultimos_titulos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/titulos/${t.id}`} style={{ fontWeight: 600 }}>
                        {t.numero_titulo}
                      </Link>
                    </td>
                    <td>{t.titulacion?.graduado?.nombre_completo ?? '—'}</td>
                    <td>{t.titulacion?.carrera ?? '—'}</td>
                    <td>
                      <Badge value={t.ubicacion_actual} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
