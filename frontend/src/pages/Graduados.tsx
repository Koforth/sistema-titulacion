import { useState, type FormEvent, useEffect } from 'react';
import { api, type Page } from '../api/client';
import { Alert, Loading, Pager } from '../components/ui';
import { useAuth } from '../auth/AuthContext';
import { errorMessage, useApi } from '../hooks/useApi';
import type { Graduado } from '../api/types';

export default function Graduados() {
  const { can } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [editingGraduado, setEditingGraduado] = useState<Graduado | null>(null);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [page, setPage] = useState(1);

  // Filtros de búsqueda (Estilo SETEC)
  const [docFilter, setDocFilter] = useState('');
  const [nombresFilter, setNombresFilter] = useState('');
  const [apellidosFilter, setApellidosFilter] = useState('');
  const [queryUrl, setQueryUrl] = useState('/graduados?page=1');

  // Carga de lista
  const { data, error, loading, reload } = useApi<Page<Graduado>>(queryUrl);

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

  // Estado del formulario modal multi-paso
  const [formData, setFormData] = useState({
    tipo_identidad: 'Cédula de Identidad Nicaragüense',
    cedula: '',
    carnet: '',
    nombres: '',
    apellidos: '',
    nombre_completo: '',
    sexo: 'Femenino',
    pais: 'Nicaragua',
    estado_civil: 'Soltero(a)',
    etnia: 'Mestizo',
    departamento_origen: 'León',
    municipio_origen: 'León',
    departamento_residencia: 'León',
    municipio_residencia: 'León',
    direccion_residencia: '',
    email: '',
    telefono: '',
    linea_telefonica: 'Claro',
    anio_bachillerato: '2020',
    codigo_estudiante: '',
    tipo_bachillerato: 'Regular',
    turno_bachillerato: 'Matutino',
    modalidad_bachillerato: 'Presencial',
  });

  const abrirModalCrear = () => {
    setEditingGraduado(null);
    setFormData({
      tipo_identidad: 'Cédula de Identidad Nicaragüense',
      cedula: '',
      carnet: '',
      nombres: '',
      apellidos: '',
      nombre_completo: '',
      sexo: 'Femenino',
      pais: 'Nicaragua',
      estado_civil: 'Soltero(a)',
      etnia: 'Mestizo',
      departamento_origen: 'León',
      municipio_origen: 'León',
      departamento_residencia: 'León',
      municipio_residencia: 'León',
      direccion_residencia: '',
      email: '',
      telefono: '',
      linea_telefonica: 'Claro',
      anio_bachillerato: '2020',
      codigo_estudiante: '',
      tipo_bachillerato: 'Regular',
      turno_bachillerato: 'Matutino',
      modalidad_bachillerato: 'Presencial',
    });
    setCurrentStep(1);
    setModalOpen(true);
  };

  const abrirModalEditar = (g: Graduado) => {
    setEditingGraduado(g);
    setFormData({
      tipo_identidad: g.tipo_identidad || 'Cédula de Identidad Nicaragüense',
      cedula: g.cedula || '',
      carnet: g.carnet || '',
      nombres: g.nombres || '',
      apellidos: g.apellidos || '',
      nombre_completo: g.nombre_completo || '',
      sexo: g.sexo || 'Femenino',
      pais: g.pais || 'Nicaragua',
      estado_civil: g.estado_civil || 'Soltero(a)',
      etnia: g.etnia || 'Mestizo',
      departamento_origen: g.departamento_origen || 'León',
      municipio_origen: g.municipio_origen || 'León',
      departamento_residencia: g.departamento_residencia || 'León',
      municipio_residencia: g.municipio_residencia || 'León',
      direccion_residencia: g.direccion_residencia || '',
      email: g.email || '',
      telefono: g.telefono || '',
      linea_telefonica: 'Claro',
      anio_bachillerato: g.anio_bachillerato || '2020',
      codigo_estudiante: g.carnet || '',
      tipo_bachillerato: g.tipo_bachillerato || 'Regular',
      turno_bachillerato: g.turno_bachillerato || 'Matutino',
      modalidad_bachillerato: g.modalidad_bachillerato || 'Presencial',
    });
    setCurrentStep(1);
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Actualizar automáticamente nombre completo si cambian nombres o apellidos
      nombre_completo:
        name === 'nombres'
          ? `${value} ${prev.apellidos}`.trim()
          : name === 'apellidos'
          ? `${prev.nombres} ${value}`.trim()
          : prev.nombre_completo,
    }));
  };

  const guardarGraduado = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...formData,
        nombre_completo:
          formData.nombre_completo || `${formData.nombres} ${formData.apellidos}`.trim() || 'Sin Nombre',
      };

      if (editingGraduado) {
        await api(`/graduados/${editingGraduado.id}`, { method: 'PUT', body: payload });
        setMsg({ kind: 'success', text: 'Graduado actualizado exitosamente.' });
      } else {
        await api('/graduados', { method: 'POST', body: payload });
        setMsg({ kind: 'success', text: 'Graduado registrado correctamente en el sistema.' });
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      setMsg({ kind: 'error', text: errorMessage(err) });
    }
  };

  const eliminarGraduado = async (g: Graduado) => {
    if (!confirm(`¿Está seguro de eliminar el registro de ${g.nombre_completo}?`)) return;
    try {
      await api(`/graduados/${g.id}`, { method: 'DELETE' });
      setMsg({ kind: 'success', text: 'Graduado eliminado.' });
      reload();
    } catch (err) {
      setMsg({ kind: 'error', text: errorMessage(err) });
    }
  };

  return (
    <div className="graduados-container">
      {/* Barra superior estilo SETEC */}
      <div className="setec-header-bar">
        <h2>Graduados</h2>
        {can('admin', 'operador') && (
          <button type="button" className="setec-btn-primary" onClick={abrirModalCrear}>
            + Registrar Nuevo Graduado
          </button>
        )}
      </div>

      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}

      {/* Tarjeta de Filtros (Filtrar Registros) */}
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

      {/* Tabla de Resultados SETEC */}
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
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }} className="muted">
                        No se encontraron graduados registrados.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((g, index) => (
                      <tr key={g.id}>
                        <td className="muted">{(data.current_page - 1) * 15 + index + 1}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {g.nombre_completo || `${g.nombres ?? ''} ${g.apellidos ?? ''}`}
                        </td>
                        <td>{g.sexo || 'Femenino'}</td>
                        <td>
                          {g.cedula ? (
                            <span>Cédula de Identidad Nicaragüense : <b>{g.cedula}</b></span>
                          ) : g.carnet ? (
                            <span>Carnet Universitario : <b>{g.carnet}</b></span>
                          ) : (
                            <span className="muted">Sin documento registrado</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            {can('admin', 'operador') && (
                              <button
                                type="button"
                                className="icon-btn btn-edit"
                                onClick={() => abrirModalEditar(g)}
                                title="Editar datos"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              type="button"
                              className="icon-btn btn-info"
                              onClick={() =>
                                alert(
                                  `Graduado: ${g.nombre_completo}\nEmail: ${g.email ?? '—'}\nTeléfono: ${g.telefono ?? '—'}\nOrigen: ${g.departamento_origen ?? '—'}`
                                )
                              }
                              title="Información detallada"
                            >
                              ℹ️
                            </button>
                            {can('admin') && (
                              <button
                                type="button"
                                className="icon-btn btn-delete"
                                onClick={() => eliminarGraduado(g)}
                                title="Eliminar graduado"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager page={data} onChange={cambiarPagina} />
          </div>
        )
      )}

      {/* === MODAL MULTI-PASO (ESTILO SETEC / CREAR GRADUADO) === */}
      {modalOpen && (
        <div className="setec-modal-backdrop">
          <div className="setec-modal" role="dialog" aria-labelledby="modal-graduado-title">
            <div className="modal-top-bar">
              <h3 id="modal-graduado-title">{editingGraduado ? 'Editar Graduado' : 'Crear Graduado'}</h3>
              <button
                type="button"
                className="close-x-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Stepper / Pestañas de Pasos estilo SETEC */}
            <div className="stepper-tabs">
              <div
                className={`step-tab ${currentStep === 1 ? 'active' : ''}`}
                onClick={() => setCurrentStep(1)}
              >
                <span>👤 Datos Personales</span>
              </div>
              <div
                className={`step-tab ${currentStep === 2 ? 'active' : ''}`}
                onClick={() => setCurrentStep(2)}
              >
                <span>@ Datos de Contacto</span>
              </div>
              <div
                className={`step-tab ${currentStep === 3 ? 'active' : ''}`}
                onClick={() => setCurrentStep(3)}
              >
                <span>🎓 Datos Académicos</span>
              </div>
            </div>

            <div className="modal-content-body">
              {/* PASO 1: DATOS PERSONALES */}
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Tipo de Identidad *</label>
                      <select
                        name="tipo_identidad"
                        value={formData.tipo_identidad}
                        onChange={handleChange}
                      >
                        <option value="Cédula de Identidad Nicaragüense">
                          Cédula de Identidad Nicaragüense
                        </option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="Carné de Residente">Carné de Residente</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Documento de Identidad *</label>
                      <input
                        type="text"
                        name="cedula"
                        placeholder="Ej. 001-010190-0001A"
                        value={formData.cedula}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Sexo *</label>
                      <select name="sexo" value={formData.sexo} onChange={handleChange}>
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Nombres *</label>
                      <input
                        type="text"
                        name="nombres"
                        placeholder="Nombres del Titulado"
                        value={formData.nombres}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Apellidos *</label>
                      <input
                        type="text"
                        name="apellidos"
                        placeholder="Apellidos del Titulado"
                        value={formData.apellidos}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>País *</label>
                      <select name="pais" value={formData.pais} onChange={handleChange}>
                        <option value="Nicaragua">Nicaragua</option>
                        <option value="Costa Rica">Costa Rica</option>
                        <option value="Honduras">Honduras</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Estado Civil *</label>
                      <select
                        name="estado_civil"
                        value={formData.estado_civil}
                        onChange={handleChange}
                      >
                        <option value="Soltero(a)">Soltero(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Unión de Hecho">Unión de Hecho</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Departamento Origen *</label>
                      <select
                        name="departamento_origen"
                        value={formData.departamento_origen}
                        onChange={handleChange}
                      >
                        <option value="León">León</option>
                        <option value="Managua">Managua</option>
                        <option value="Chinandega">Chinandega</option>
                        <option value="Matagalpa">Matagalpa</option>
                        <option value="Estelí">Estelí</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Municipio Origen *</label>
                      <select
                        name="municipio_origen"
                        value={formData.municipio_origen}
                        onChange={handleChange}
                      >
                        <option value="León">León</option>
                        <option value="Nagarote">Nagarote</option>
                        <option value="La Paz Centro">La Paz Centro</option>
                        <option value="Malpaisillo">Malpaisillo</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Etnia *</label>
                      <select name="etnia" value={formData.etnia} onChange={handleChange}>
                        <option value="Mestizo">Mestizo</option>
                        <option value="Miskito">Miskito</option>
                        <option value="Creole">Creole</option>
                        <option value="Chorotega">Chorotega</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Departamento Residencia *</label>
                      <select
                        name="departamento_residencia"
                        value={formData.departamento_residencia}
                        onChange={handleChange}
                      >
                        <option value="León">León</option>
                        <option value="Managua">Managua</option>
                        <option value="Chinandega">Chinandega</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Municipio Residencia *</label>
                      <select
                        name="municipio_residencia"
                        value={formData.municipio_residencia}
                        onChange={handleChange}
                      >
                        <option value="León">León</option>
                        <option value="Nagarote">Nagarote</option>
                        <option value="La Paz Centro">La Paz Centro</option>
                      </select>
                    </div>

                    <div className="form-field col-span-3">
                      <label>Dirección de Residencia *</label>
                      <textarea
                        name="direccion_residencia"
                        rows={2}
                        placeholder="Dirección de Residencia/Domicilio del Titulado"
                        value={formData.direccion_residencia}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: DATOS DE CONTACTO */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="form-field" style={{ marginBottom: '1.5rem' }}>
                    <label>Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="alguien@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="setec-subbox">
                    <div className="subbox-header">
                      <h4>📞 Teléfonos del Titulado</h4>
                      <button type="button" className="btn-add-phone" onClick={() => {}}>
                        + Agregar Teléfono
                      </button>
                    </div>

                    <table className="sub-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>#</th>
                          <th>Línea Telefónica</th>
                          <th>Número de Teléfono</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>
                            <select
                              name="linea_telefonica"
                              value={formData.linea_telefonica}
                              onChange={handleChange}
                            >
                              <option value="Claro">Claro</option>
                              <option value="Tigo">Tigo</option>
                              <option value="Convencional">Convencional</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              name="telefono"
                              placeholder="0000-0000"
                              value={formData.telefono}
                              onChange={handleChange}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-trash"
                              onClick={() => setFormData((p) => ({ ...p, telefono: '' }))}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PASO 3: DATOS ACADÉMICOS */}
              {currentStep === 3 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Año de Bachillerato *</label>
                      <input
                        type="text"
                        name="anio_bachillerato"
                        placeholder="Ej. 2018"
                        value={formData.anio_bachillerato}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-field">
                      <label>Código de Estudiante / Carnet *</label>
                      <input
                        type="text"
                        name="carnet"
                        placeholder="Ej. 22-01928-0"
                        value={formData.carnet}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Tipo de Bachillerato *</label>
                      <select
                        name="tipo_bachillerato"
                        value={formData.tipo_bachillerato}
                        onChange={handleChange}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Por Madurez">Por Madurez</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Turno del Bachillerato *</label>
                      <select
                        name="turno_bachillerato"
                        value={formData.turno_bachillerato}
                        onChange={handleChange}
                      >
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                        <option value="Sabatino">Sabatino</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Modalidad del Bachillerato *</label>
                      <select
                        name="modalidad_bachillerato"
                        value={formData.modalidad_bachillerato}
                        onChange={handleChange}
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="A Distancia">A Distancia</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de navegación inferior estilo SETEC */}
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
                    onClick={() => guardarGraduado()}
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
