import { useState, type FormEvent, useEffect } from 'react';
import { api, type Page } from '../api/client';
import { Alert, Loading, Pager, Badge, fecha } from '../components/ui';
import { useAuth } from '../auth/AuthContext';
import { errorMessage, useApi } from '../hooks/useApi';
import type { Graduado, Titulacion } from '../api/types';

export default function Titulaciones() {
  const { can, user } = useAuth();
  const [selectedGraduado, setSelectedGraduado] = useState<Graduado | null>(null);

  // Filtros de búsqueda (Estilo SETEC)
  const [docFilter, setDocFilter] = useState('');
  const [nombresFilter, setNombresFilter] = useState('');
  const [apellidosFilter, setApellidosFilter] = useState('');
  const [queryUrl, setQueryUrl] = useState('/graduados?page=1');
  const [page, setPage] = useState(1);

  // Carga de lista de Graduados
  const { data, error, loading, reload } = useApi<Page<Graduado>>(queryUrl);

  // Lista de Títulos/Titulaciones del graduado seleccionado
  const [titulaciones, setTitulaciones] = useState<Titulacion[]>([]);
  const [loadingTitulaciones, setLoadingTitulaciones] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  // Estado del Modal "Crear Título"
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [editingTitulacion, setEditingTitulacion] = useState<Titulacion | null>(null);

  const [formData, setFormData] = useState({
    titulo_obtenido: '',
    carrera: 'Ingeniería en Sistemas de Información',
    anio_inicio_estudio: '2019',
    anio_fin_estudio: '2023',
    anio_graduacion: '2024',
    registrado_no: '',
    folio: '',
    tomo_registro: '',
    fecha_emision_titulo: new Date().toISOString().split('T')[0],
    sede: 'Sede Central - León',
    duracion_anios: '5 años',
    numero_asignaturas: '54',
    programa_especial: 'Ninguno',
    forma_culminacion: 'Monografía',
    numero_gaceta: '',
    pagina_gaceta: '',
    fecha_gaceta: '',
    acceso_internet: false,
    tipo_acceso_internet: 'Sin Especificar',
    empresa_acceso_internet: 'Sin Especificar',
    fecha_registro_setec: new Date().toISOString().split('T')[0],
    registrador: user?.name ? `${user.name} (${user.role})` : 'Registrador Autorizado',
  });

  const aplicarFiltros = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    params.set('page', '1');
    if (docFilter.trim()) params.set('documento', docFilter.trim());
    if (nombresFilter.trim()) params.set('nombres', nombresFilter.trim());
    if (apellidosFilter.trim()) params.set('apellidos', apellidosFilter.trim());
    setQueryUrl(`/graduados?${params.toString()}`);
  };

  const limpiarFiltros = () => {
    setDocFilter('');
    setNombresFilter('');
    setApellidosFilter('');
    setPage(1);
    setQueryUrl('/graduados?page=1');
  };

  const cambiarPagina = (p: number) => {
    setPage(p);
    const params = new URLSearchParams(queryUrl.split('?')[1] || '');
    params.set('page', p.toString());
    setQueryUrl(`/graduados?${params.toString()}`);
  };

  // Cargar titulaciones cuando se selecciona un graduado
  const seleccionarGraduado = async (g: Graduado) => {
    setSelectedGraduado(g);
    setLoadingTitulaciones(true);
    try {
      const res = await api<Page<Titulacion>>(`/titulaciones?graduado_id=${g.id}`);
      setTitulaciones(res.data || []);
    } catch (err) {
      setMsg({ kind: 'error', text: 'Error al cargar títulos del graduado.' });
    } finally {
      setLoadingTitulaciones(false);
    }
  };

  const reloadTitulaciones = async (graduadoId: number) => {
    setLoadingTitulaciones(true);
    try {
      const res = await api<Page<Titulacion>>(`/titulaciones?graduado_id=${graduadoId}`);
      setTitulaciones(res.data || []);
    } catch (err) {
      // Ignorar
    } finally {
      setLoadingTitulaciones(false);
    }
  };

  const abrirModalCrearTitulo = () => {
    if (!selectedGraduado) return;
    setEditingTitulacion(null);
    setFormData({
      titulo_obtenido: '',
      carrera: 'Ingeniería en Sistemas de Información',
      anio_inicio_estudio: '2019',
      anio_fin_estudio: '2023',
      anio_graduacion: '2024',
      registrado_no: '',
      folio: '',
      tomo_registro: '',
      fecha_emision_titulo: new Date().toISOString().split('T')[0],
      sede: 'Sede Central - León',
      duracion_anios: '5 años',
      numero_asignaturas: '54',
      programa_especial: 'Ninguno',
      forma_culminacion: 'Monografía',
      numero_gaceta: '',
      pagina_gaceta: '',
      fecha_gaceta: '',
      acceso_internet: false,
      tipo_acceso_internet: 'Sin Especificar',
      empresa_acceso_internet: 'Sin Especificar',
      fecha_registro_setec: new Date().toISOString().split('T')[0],
      registrador: user?.name ? `${user.name} (${user.role})` : 'Registrador Autorizado',
    });
    setCurrentStep(1);
    setModalOpen(true);
  };

  const abrirModalEditarTitulo = (t: Titulacion) => {
    setEditingTitulacion(t);
    setFormData({
      titulo_obtenido: t.titulo_obtenido || '',
      carrera: t.carrera || '',
      anio_inicio_estudio: t.anio_inicio_estudio || '2019',
      anio_fin_estudio: t.anio_fin_estudio || '2023',
      anio_graduacion: t.anio_graduacion || '2024',
      registrado_no: t.registrado_no || '',
      folio: t.folio || '',
      tomo_registro: t.tomo_registro || '',
      fecha_emision_titulo: t.fecha_emision_titulo?.split('T')[0] || '',
      sede: t.sede || 'Sede Central - León',
      duracion_anios: t.duracion_anios || '5 años',
      numero_asignaturas: t.numero_asignaturas || '54',
      programa_especial: t.programa_especial || 'Ninguno',
      forma_culminacion: t.forma_culminacion || 'Monografía',
      numero_gaceta: t.numero_gaceta || '',
      pagina_gaceta: t.pagina_gaceta || '',
      fecha_gaceta: t.fecha_gaceta?.split('T')[0] || '',
      acceso_internet: !!t.acceso_internet,
      tipo_acceso_internet: t.tipo_acceso_internet || 'Sin Especificar',
      empresa_acceso_internet: t.empresa_acceso_internet || 'Sin Especificar',
      fecha_registro_setec: t.fecha_registro_setec?.split('T')[0] || '',
      registrador: t.registrador || user?.name || '',
    });
    setCurrentStep(1);
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const guardarTitulo = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGraduado) return;
    try {
      const payload = {
        ...formData,
        graduado_id: selectedGraduado.id,
        titulo_obtenido: formData.titulo_obtenido || formData.carrera,
        fecha_titulacion: formData.fecha_emision_titulo,
      };

      if (editingTitulacion) {
        await api(`/titulaciones/${editingTitulacion.id}`, { method: 'PUT', body: payload });
        setMsg({ kind: 'success', text: 'Título actualizado exitosamente.' });
      } else {
        await api('/titulaciones', { method: 'POST', body: payload });
        setMsg({ kind: 'success', text: 'Nuevo título registrado exitosamente al graduado.' });
      }
      setModalOpen(false);
      reloadTitulaciones(selectedGraduado.id);
    } catch (err) {
      setMsg({ kind: 'error', text: errorMessage(err) });
    }
  };

  const eliminarTitulo = async (t: Titulacion) => {
    if (!confirm(`¿Eliminar la titulación de "${t.titulo_obtenido || t.carrera}"?`)) return;
    try {
      await api(`/titulaciones/${t.id}`, { method: 'DELETE' });
      setMsg({ kind: 'success', text: 'Titulación eliminada.' });
      if (selectedGraduado) reloadTitulaciones(selectedGraduado.id);
    } catch (err) {
      setMsg({ kind: 'error', text: errorMessage(err) });
    }
  };

  return (
    <div className="titulaciones-view-container">
      {/* TARJETA 1: FILTRAR REGISTROS (ESTILO SETEC TITULACIONES) */}
      <div className="card setec-filter-card">
        <div className="filter-title">
          <span>🍸</span> <strong>Filtrar Registros</strong>
        </div>

        <form onSubmit={aplicarFiltros}>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Documento de Identidad</label>
              <input
                type="text"
                placeholder="Cédula, Carné, INSS..."
                value={docFilter}
                onChange={(e) => setDocFilter(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Nombres</label>
              <input
                type="text"
                placeholder="Filtrar por Nombres..."
                value={nombresFilter}
                onChange={(e) => setNombresFilter(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Apellidos</label>
              <input
                type="text"
                placeholder="Filtrar por Apellidos..."
                value={apellidosFilter}
                onChange={(e) => setApellidosFilter(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn-search">
                🔍 Buscar
              </button>
              <button type="button" className="btn-clear" onClick={limpiarFiltros} title="Limpiar filtros">
                🧹
              </button>
            </div>
          </div>
        </form>
      </div>

      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}

      {/* TABLA SUPERIOR DE GRADUADOS ENCONTRADOS */}
      {error && <Alert>{error}</Alert>}
      {loading && !data ? (
        <Loading />
      ) : (
        data && (
          <div className="table-card">
            <div className="table-container">
              <table className="setec-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Nombres y Apellidos</th>
                    <th>Sexo</th>
                    <th>Doc. Identidad</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }} className="muted">
                        No se encontraron registros de graduados.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((g, index) => {
                      const isSelected = selectedGraduado?.id === g.id;
                      return (
                        <tr
                          key={g.id}
                          className={isSelected ? 'row-selected' : ''}
                          onClick={() => seleccionarGraduado(g)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="muted">{(data.current_page - 1) * 15 + index + 1}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            {g.nombre_completo || `${g.nombres ?? ''} ${g.apellidos ?? ''}`}
                          </td>
                          <td>{g.sexo || 'Femenino'}</td>
                          <td>
                            {g.cedula ? (
                              <span>Cédula de Identidad Nicaragüense : <b>{g.cedula}</b></span>
                            ) : g.carnet ? (
                              <span>Carnet : <b>{g.carnet}</b></span>
                            ) : (
                              <span className="muted">Sin documento</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              <button
                                type="button"
                                className="icon-btn btn-info"
                                title="Ver detalles"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  seleccionarGraduado(g);
                                }}
                              >
                                ℹ️
                              </button>
                              <button
                                type="button"
                                className={`icon-btn ${isSelected ? 'btn-active-list' : 'btn-select-list'}`}
                                title="Ver Títulos Registrados"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  seleccionarGraduado(g);
                                }}
                              >
                                📋
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <Pager page={data} onChange={cambiarPagina} />
          </div>
        )
      )}

      {/* SECCIÓN INFERIOR: TÍTULOS REGISTRADOS DEL GRADUADO SELECCIONADO */}
      {selectedGraduado ? (
        <div className="titulos-registrados-card">
          <div className="titulos-header-bar">
            <h3>Títulos Registrados</h3>
            {can('admin', 'operador') && (
              <button type="button" className="setec-btn-primary" onClick={abrirModalCrearTitulo}>
                + Registrar Nuevo Título
              </button>
            )}
          </div>

          {/* Ficha Resumen del Graduado Seleccionado */}
          <div className="graduado-selected-summary">
            <div className="summary-field">
              <label>Tipo de Identidad</label>
              <input type="text" readOnly value={selectedGraduado.tipo_identidad || 'Cédula de Identidad Nicaragüense'} />
            </div>
            <div className="summary-field">
              <label>Documento de Identidad</label>
              <input type="text" readOnly value={selectedGraduado.cedula || selectedGraduado.carnet || '—'} />
            </div>
            <div className="summary-field">
              <label>Sexo</label>
              <input type="text" readOnly value={selectedGraduado.sexo || 'Femenino'} />
            </div>
            <div className="summary-field col-span-2">
              <label>Nombres</label>
              <input type="text" readOnly value={selectedGraduado.nombres || selectedGraduado.nombre_completo.split(' ')[0]} />
            </div>
            <div className="summary-field col-span-2">
              <label>Apellidos</label>
              <input type="text" readOnly value={selectedGraduado.apellidos || selectedGraduado.nombre_completo.split(' ').slice(1).join(' ')} />
            </div>
          </div>

          {/* Tabla de Títulos Registrados de este Graduado */}
          {loadingTitulaciones ? (
            <Loading />
          ) : titulaciones.length === 0 ? (
            <div className="warning-empty-banner">
              ⚠️ ¡No existen títulos registrados para este graduado! Haga clic en <b>"+ Registrar Nuevo Título"</b> para agregar uno.
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table className="setec-table">
                <thead>
                  <tr>
                    <th>Título Obtenido / Carrera</th>
                    <th>N.º Registro</th>
                    <th>Folio / Tomo</th>
                    <th>F. Emisión</th>
                    <th>Estado Físico</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {titulaciones.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>
                        {t.titulo_obtenido || t.carrera}
                        <div className="muted" style={{ fontSize: '0.8rem' }}>{t.carrera} ({t.sede ?? 'León'})</div>
                      </td>
                      <td>{t.registrado_no || '—'}</td>
                      <td>{t.folio && t.tomo_registro ? `Folio: ${t.folio} / Tomo: ${t.tomo_registro}` : '—'}</td>
                      <td>{fecha(t.fecha_emision_titulo || t.fecha_titulacion)}</td>
                      <td>
                        {t.titulo_fisico ? (
                          <Badge value={t.titulo_fisico.ubicacion_actual} />
                        ) : (
                          <span className="badge gray">Sin emitir</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          {can('admin', 'operador') && (
                            <button
                              type="button"
                              className="icon-btn btn-edit"
                              onClick={() => abrirModalEditarTitulo(t)}
                              title="Editar título"
                            >
                              ✏️
                            </button>
                          )}
                          {can('admin') && (
                            <button
                              type="button"
                              className="icon-btn btn-delete"
                              onClick={() => eliminarTitulo(t)}
                              title="Eliminar título"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="info-select-graduado">
          💡 Seleccione un graduado de la tabla superior para visualizar o registrar sus títulos universitarios.
        </div>
      )}

      {/* === MODAL MULTI-PASO (CREAR / EDITAR TÍTULO) === */}
      {modalOpen && (
        <div className="setec-modal-backdrop">
          <div className="setec-modal" role="dialog" aria-labelledby="modal-titulo-title">
            <div className="modal-top-bar">
              <h3 id="modal-titulo-title">{editingTitulacion ? 'Editar Título' : 'Crear Título'}</h3>
              <button
                type="button"
                className="close-x-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Stepper Tabs SETEC: Datos del Título, Datos Adicionales, Evidencias */}
            <div className="stepper-tabs">
              <div
                className={`step-tab ${currentStep === 1 ? 'active' : ''}`}
                onClick={() => setCurrentStep(1)}
              >
                <span>🎓 Datos del Título</span>
              </div>
              <div
                className={`step-tab ${currentStep === 2 ? 'active' : ''}`}
                onClick={() => setCurrentStep(2)}
              >
                <span>ℹ️ Datos Adicionales</span>
              </div>
              <div
                className={`step-tab ${currentStep === 3 ? 'active' : ''}`}
                onClick={() => setCurrentStep(3)}
              >
                <span>🖼️ Evidencias del Trámite</span>
              </div>
            </div>

            <div className="modal-content-body">
              {/* PASO 1: DATOS DEL TÍTULO */}
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field col-span-3">
                      <label>Título Obtenido *</label>
                      <input
                        type="text"
                        name="titulo_obtenido"
                        placeholder="Descripción del Título Obtenido (Ej. Licenciado en Contaduría Pública)"
                        value={formData.titulo_obtenido}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Año Inicio de Estudio *</label>
                      <input
                        type="text"
                        name="anio_inicio_estudio"
                        placeholder="Ej. 2019"
                        value={formData.anio_inicio_estudio}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Año Fin de Estudio *</label>
                      <input
                        type="text"
                        name="anio_fin_estudio"
                        placeholder="Ej. 2023"
                        value={formData.anio_fin_estudio}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Año de Graduación *</label>
                      <input
                        type="text"
                        name="anio_graduacion"
                        placeholder="Ej. 2024"
                        value={formData.anio_graduacion}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Registrado No. *</label>
                      <input
                        type="text"
                        name="registrado_no"
                        placeholder="Ej. 10294"
                        value={formData.registrado_no}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Folio *</label>
                      <input
                        type="text"
                        name="folio"
                        placeholder="Ej. 45"
                        value={formData.folio}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Tomo del Registro del Título *</label>
                      <input
                        type="text"
                        name="tomo_registro"
                        placeholder="Ej. III"
                        value={formData.tomo_registro}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>F. Emisión del Título *</label>
                      <input
                        type="date"
                        name="fecha_emision_titulo"
                        value={formData.fecha_emision_titulo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field col-span-2">
                      <label>Sede *</label>
                      <select name="sede" value={formData.sede} onChange={handleChange}>
                        <option value="Sede Central - León">Sede Central - León</option>
                        <option value="Sede Somoto">Sede Somoto</option>
                        <option value="Sede Jinotega">Sede Jinotega</option>
                      </select>
                    </div>

                    <div className="form-field col-span-3">
                      <label>Carrera / Maestría / Especialidad *</label>
                      <input
                        type="text"
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Duración de la Carrera en años *</label>
                      <input
                        type="text"
                        name="duracion_anios"
                        placeholder="Ej. 5 años"
                        value={formData.duracion_anios}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Número de Asignaturas *</label>
                      <input
                        type="text"
                        name="numero_asignaturas"
                        placeholder="Ej. 54"
                        value={formData.numero_asignaturas}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Programa Especial *</label>
                      <select
                        name="programa_especial"
                        value={formData.programa_especial}
                        onChange={handleChange}
                      >
                        <option value="Ninguno">Ninguno</option>
                        <option value="Universidad en el Campo">Universidad en el Campo</option>
                        <option value="Profesionalización">Profesionalización</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: DATOS ADICIONALES */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field col-span-3">
                      <label>Forma Culminación Estudio *</label>
                      <select
                        name="forma_culminacion"
                        value={formData.forma_culminacion}
                        onChange={handleChange}
                      >
                        <option value="Monografía">Monografía</option>
                        <option value="Examen de Grado">Examen de Grado</option>
                        <option value="Curso de Graduación">Curso de Graduación</option>
                        <option value="Práctica Profesional">Práctica Profesional</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Número de LA GACETA *</label>
                      <input
                        type="text"
                        name="numero_gaceta"
                        placeholder="Ej. 182"
                        value={formData.numero_gaceta}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Página LA GACETA *</label>
                      <input
                        type="text"
                        name="pagina_gaceta"
                        placeholder="Ej. 4510"
                        value={formData.pagina_gaceta}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>F. de LA GACETA *</label>
                      <input
                        type="date"
                        name="fecha_gaceta"
                        value={formData.fecha_gaceta}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field" style={{ justifyContent: 'center' }}>
                      <label>Acceso a Internet *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <input
                          type="checkbox"
                          name="acceso_internet"
                          checked={formData.acceso_internet}
                          onChange={handleChange}
                          style={{ width: 'auto', minHeight: 'auto' }}
                        />
                        <span>{formData.acceso_internet ? 'Sí' : 'No'}</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Tipo Acceso a Internet *</label>
                      <select
                        name="tipo_acceso_internet"
                        value={formData.tipo_acceso_internet}
                        onChange={handleChange}
                      >
                        <option value="Sin Especificar">Sin Especificar</option>
                        <option value="Fibra Óptica / Cable">Fibra Óptica / Cable</option>
                        <option value="Móvil / Datos">Móvil / Datos</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Empresa Acceso a Internet *</label>
                      <select
                        name="empresa_acceso_internet"
                        value={formData.empresa_acceso_internet}
                        onChange={handleChange}
                      >
                        <option value="Sin Especificar">Sin Especificar</option>
                        <option value="Claro">Claro</option>
                        <option value="Tigo">Tigo</option>
                        <option value="IBW">IBW</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Fecha de Registro *</label>
                      <input
                        type="date"
                        name="fecha_registro_setec"
                        value={formData.fecha_registro_setec}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field col-span-2">
                      <label>Registrador *</label>
                      <input
                        type="text"
                        name="registrador"
                        disabled
                        value={formData.registrador}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: EVIDENCIAS DEL TRÁMITE */}
              {currentStep === 3 && (
                <div className="step-content">
                  <table className="setec-table" style={{ border: '1px solid #e2e8f0' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>Requisito</th>
                        <th>Nombre del Documento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        'Cédula de Identidad (Requisito General)',
                        'Diploma de Bachiller (Solo Pregrado y Grado)',
                        'Certificado de Notas (Requisito General)',
                        'Plan de Estudio (Requisito General)',
                        'Título Otorgado (Requisito General)',
                        'Título de Grado (Solo Posgrado)',
                        'Acta de Defensa de Culminación de Estudio (Requisito General)',
                        'Página(s) de La Gaceta (donde aparezca el nombre del titulado) (Requisito General)',
                      ].map((req, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <span style={{ color: '#dc2626', marginRight: '4px' }}>⊗</span>
                            {req}
                          </td>
                          <td>
                            <input
                              type="file"
                              style={{ fontSize: '0.8rem', padding: '0.2rem' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Navegación inferior Modal */}
            <div className="modal-footer-nav">
              <div className="nav-buttons-left">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn-stepper btn-prev"
                    onClick={() => setCurrentStep((p) => (p - 1) as 1 | 2 | 3)}
                  >
                    Anterior
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    className="btn-stepper btn-next"
                    onClick={() => setCurrentStep((p) => (p + 1) as 1 | 2 | 3)}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-stepper btn-save"
                    onClick={() => guardarTitulo()}
                  >
                    💾 Guardar
                  </button>
                )}
                <button
                  type="button"
                  className="btn-stepper btn-close"
                  onClick={() => setModalOpen(false)}
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
