import { useState, type FormEvent } from 'react';
import { api, type Page } from '../api/client';
import { Alert, Loading, Pager, Badge, fecha } from '../components/ui';
import { useAuth } from '../auth/AuthContext';
import { errorMessage, useApi } from '../hooks/useApi';
import type { Graduado, Titulacion } from '../api/types';
import SearchableSelect from '../components/SearchableSelect';
import {
  PAISES_DEL_MUNDO,
  LISTA_DEPARTAMENTOS_NICARAGUA,
  getMunicipiosDeDepartamento,
} from '../data/geoData';

const OPCIONES_TIPO_BACHILLERATO = ['Bachiller'];

const OPCIONES_MODALIDAD_BACHILLERATO = [
  'Ciencias y Letras',
  'Preparatoria',
  'Técnico',
  'Ciclo Diversificado',
  'No Definido',
];

const OPCIONES_TURNO_BACHILLERATO = [
  'Diurno',
  'Dominical',
  'Encuentro',
  'Matutino',
  'No Definido',
  'Nocturno',
  'Sabatino',
  'Vespertino',
];

interface RequisitoEvidencia {
  id: number;
  nombre: string;
  categoria: 'General' | 'Pregrado / Grado' | 'Posgrado';
  descripcion: string;
}

const REQUISITOS_EVIDENCIAS: RequisitoEvidencia[] = [
  {
    id: 1,
    nombre: 'Cédula de Identidad',
    categoria: 'General',
    descripcion: 'Copia legible de Cédula de Identidad Nicaragüense o Pasaporte vigente.',
  },
  {
    id: 2,
    nombre: 'Diploma de Bachiller',
    categoria: 'Pregrado / Grado',
    descripcion: 'Título o diploma emitido y legalizado por el Ministerio de Educación (MINED).',
  },
  {
    id: 3,
    nombre: 'Certificado de Notas',
    categoria: 'General',
    descripcion: 'Certificación oficial de calificaciones emitida por Registro Académico.',
  },
  {
    id: 4,
    nombre: 'Plan de Estudio',
    categoria: 'General',
    descripcion: 'Constancia de cumplimiento curricular y plan de estudios aprobado.',
  },
  {
    id: 5,
    nombre: 'Título Otorgado',
    categoria: 'General',
    descripcion: 'Copia certificada del título universitario emitido por la institución.',
  },
  {
    id: 6,
    nombre: 'Título de Grado',
    categoria: 'Posgrado',
    descripcion: 'Título universitario previo de Licenciatura o Ingeniería (requerido para maestrías/especialidades).',
  },
  {
    id: 7,
    nombre: 'Acta de Defensa de Culminación de Estudio',
    categoria: 'General',
    descripcion: 'Acta oficial del jurado calificador de Monografía, Tesis o Examen de Grado.',
  },
  {
    id: 8,
    nombre: 'Página(s) de La Gaceta',
    categoria: 'General',
    descripcion: 'Publicación oficial en el Diario Oficial La Gaceta donde consta el título.',
  },
];

export default function Graduados() {
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

  // Lista de Títulos del graduado seleccionado
  const [titulaciones, setTitulaciones] = useState<Titulacion[]>([]);
  const [loadingTitulaciones, setLoadingTitulaciones] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  // Modal 1: Crear / Editar Graduado
  const [modalGraduadoOpen, setModalGraduadoOpen] = useState(false);
  const [stepGraduado, setStepGraduado] = useState<1 | 2 | 3>(1);
  const [editingGraduado, setEditingGraduado] = useState<Graduado | null>(null);

  const [formGraduado, setFormGraduado] = useState({
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
    tipo_bachillerato: 'Bachiller',
    turno_bachillerato: 'Matutino',
    modalidad_bachillerato: 'Ciencias y Letras',
  });

  // Modal 2: Crear / Editar Título (Titulaciones)
  const [modalTituloOpen, setModalTituloOpen] = useState(false);
  const [stepTitulo, setStepTitulo] = useState<1 | 2 | 3>(1);
  const [editingTitulacion, setEditingTitulacion] = useState<Titulacion | null>(null);

  const [formTitulo, setFormTitulo] = useState({
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

  const [evidenciasArchivos, setEvidenciasArchivos] = useState<Record<number, { name: string; size: string }>>({});

  const handleEvidenciaFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${sizeMb} MB`;
    setEvidenciasArchivos((prev) => ({
      ...prev,
      [id]: { name: file.name, size: sizeStr },
    }));
  };

  const handleRemoveEvidencia = (id: number) => {
    setEvidenciasArchivos((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const isPaisNicaragua = formGraduado.pais.trim().toLowerCase() === 'nicaragua';

  // Filtros
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

  // Seleccionar Graduado para cargar sus Títulos
  const seleccionarGraduado = async (g: Graduado) => {
    setSelectedGraduado(g);
    setLoadingTitulaciones(true);
    try {
      const res = await api<Page<Titulacion>>(`/titulaciones?graduado_id=${g.id}`);
      setTitulaciones(res.data || []);
    } catch (err) {
      setMsg({ kind: 'error', text: 'Error al consultar títulos del graduado.' });
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

  // Estado de consulta a la API Académica Externa
  const [academicQuery, setAcademicQuery] = useState('');
  const [searchingAcademic, setSearchingAcademic] = useState(false);
  const [academicStatusMsg, setAcademicStatusMsg] = useState<{ kind: 'info' | 'error' | 'success'; text: string } | null>(null);

  const consultarApiExterna = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!academicQuery.trim()) {
      setAcademicStatusMsg({ kind: 'error', text: 'Ingrese un número de cédula o código del MINED para consultar.' });
      return;
    }
    setSearchingAcademic(true);
    setAcademicStatusMsg({ kind: 'info', text: 'Consultando API Académica Externa...' });
    try {
      const res = await api<{ encontrado: boolean; estudiante?: any; origen?: string }>(
        `/academic/buscar?q=${encodeURIComponent(academicQuery.trim())}`
      );
      if (res && res.estudiante) {
        const est = res.estudiante;
        setFormGraduado((prev) => ({
          ...prev,
          tipo_identidad: est.tipo_identidad || prev.tipo_identidad,
          cedula: est.cedula || prev.cedula,
          carnet: est.carnet || prev.carnet,
          nombres: est.nombres || prev.nombres,
          apellidos: est.apellidos || prev.apellidos,
          nombre_completo: est.nombre_completo || prev.nombre_completo,
          sexo: est.sexo || prev.sexo,
          pais: est.pais || prev.pais,
          estado_civil: est.estado_civil || prev.estado_civil,
          etnia: est.etnia || prev.etnia,
          departamento_origen:
            (est.pais || prev.pais || '').trim().toLowerCase() === 'nicaragua'
              ? est.departamento_origen || prev.departamento_origen
              : 'NO DEFINIDO',
          municipio_origen:
            (est.pais || prev.pais || '').trim().toLowerCase() === 'nicaragua'
              ? est.municipio_origen || prev.municipio_origen
              : 'NO DEFINIDO',
          departamento_residencia: est.departamento_residencia || prev.departamento_residencia,
          municipio_residencia: est.municipio_residencia || prev.municipio_residencia,
          direccion_residencia: est.direccion_residencia || prev.direccion_residencia,
          email: est.email || prev.email,
          telefono: est.telefono || prev.telefono,
          linea_telefonica: est.linea_telefonica || prev.linea_telefonica,
          anio_bachillerato: est.anio_bachillerato || prev.anio_bachillerato,
          codigo_estudiante: est.carnet || prev.codigo_estudiante,
          tipo_bachillerato: est.tipo_bachillerato || prev.tipo_bachillerato,
          turno_bachillerato: est.turno_bachillerato || prev.turno_bachillerato,
          modalidad_bachillerato: est.modalidad_bachillerato || prev.modalidad_bachillerato,
        }));
        setAcademicStatusMsg({
          kind: 'success',
          text: `¡Estudiante localizado en ${res.origen ?? 'API Académica'}! Datos autocompletados.`,
        });
      } else {
        setAcademicStatusMsg({ kind: 'error', text: 'No se encontraron datos en la API académica para ese identificador.' });
      }
    } catch (err) {
      setAcademicStatusMsg({ kind: 'error', text: errorMessage(err) });
    } finally {
      setSearchingAcademic(false);
    }
  };

  // Acciones Graduado
  const abrirModalCrearGraduado = () => {
    setEditingGraduado(null);
    setAcademicQuery('');
    setAcademicStatusMsg(null);
    setFormGraduado({
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
      tipo_bachillerato: 'Bachiller',
      turno_bachillerato: 'Matutino',
      modalidad_bachillerato: 'Ciencias y Letras',
    });
    setStepGraduado(1);
    setModalGraduadoOpen(true);
  };

  const abrirModalEditarGraduado = (g: Graduado) => {
    setEditingGraduado(g);
    const paisVal = g.pais || 'Nicaragua';
    const esNicaragua = paisVal.trim().toLowerCase() === 'nicaragua';

    setFormGraduado({
      tipo_identidad: g.tipo_identidad || 'Cédula de Identidad Nicaragüense',
      cedula: g.cedula || '',
      carnet: g.carnet || '',
      nombres: g.nombres || '',
      apellidos: g.apellidos || '',
      nombre_completo: g.nombre_completo || '',
      sexo: g.sexo || 'Femenino',
      pais: paisVal,
      estado_civil: g.estado_civil || 'Soltero(a)',
      etnia: g.etnia || 'Mestizo',
      departamento_origen: esNicaragua ? g.departamento_origen || 'León' : 'NO DEFINIDO',
      municipio_origen: esNicaragua ? g.municipio_origen || 'León' : 'NO DEFINIDO',
      departamento_residencia: g.departamento_residencia || 'León',
      municipio_residencia: g.municipio_residencia || 'León',
      direccion_residencia: g.direccion_residencia || '',
      email: g.email || '',
      telefono: g.telefono || '',
      linea_telefonica: 'Claro',
      anio_bachillerato: g.anio_bachillerato || '2020',
      codigo_estudiante: g.carnet || '',
      tipo_bachillerato: g.tipo_bachillerato || 'Bachiller',
      turno_bachillerato: g.turno_bachillerato || 'Matutino',
      modalidad_bachillerato: g.modalidad_bachillerato || 'Ciencias y Letras',
    });
    setStepGraduado(1);
    setModalGraduadoOpen(true);
  };

  const handleGraduadoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormGraduado((prev) => ({
      ...prev,
      [name]: value,
      nombre_completo:
        name === 'nombres'
          ? `${value} ${prev.apellidos}`.trim()
          : name === 'apellidos'
            ? `${prev.nombres} ${value}`.trim()
            : prev.nombre_completo,
    }));
  };

  const handleGraduadoSelectChange = (name: string, value: string) => {
    setFormGraduado((prev) => {
      const updated = { ...prev, [name]: value };

      // Regla de negocio: Si el país no es Nicaragua, Departamento y Municipio de origen son NO DEFINIDO
      if (name === 'pais') {
        const esNicaragua = value.trim().toLowerCase() === 'nicaragua';
        if (!esNicaragua) {
          updated.departamento_origen = 'NO DEFINIDO';
          updated.municipio_origen = 'NO DEFINIDO';
        } else {
          if (updated.departamento_origen === 'NO DEFINIDO') {
            updated.departamento_origen = 'León';
            updated.municipio_origen = 'León';
          }
        }
      }

      // Regla de negocio: Vincular Departamento de Origen con sus Municipios
      if (name === 'departamento_origen') {
        if (value === 'NO DEFINIDO') {
          updated.municipio_origen = 'NO DEFINIDO';
        } else {
          const municipios = getMunicipiosDeDepartamento(value);
          if (!municipios.includes(updated.municipio_origen)) {
            updated.municipio_origen = municipios[0] || 'León';
          }
        }
      }

      // Regla de negocio: Vincular Departamento de Residencia con sus Municipios
      if (name === 'departamento_residencia') {
        const municipios = getMunicipiosDeDepartamento(value);
        if (!municipios.includes(updated.municipio_residencia)) {
          updated.municipio_residencia = municipios[0] || 'León';
        }
      }

      return updated;
    });
  };

  const handleTituloSelectChange = (name: string, value: string) => {
    setFormTitulo((prev) => ({ ...prev, [name]: value }));
  };

  const guardarGraduado = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...formGraduado,
        nombre_completo:
          formGraduado.nombre_completo || `${formGraduado.nombres} ${formGraduado.apellidos}`.trim() || 'Sin Nombre',
      };

      if (editingGraduado) {
        await api(`/graduados/${editingGraduado.id}`, { method: 'PUT', body: payload });
        setMsg({ kind: 'success', text: 'Graduado actualizado exitosamente.' });
      } else {
        await api('/graduados', { method: 'POST', body: payload });
        setMsg({ kind: 'success', text: 'Graduado registrado correctamente en el sistema.' });
      }
      setModalGraduadoOpen(false);
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
      if (selectedGraduado?.id === g.id) {
        setSelectedGraduado(null);
        setTitulaciones([]);
      }
      reload();
    } catch (err) {
      setMsg({ kind: 'error', text: errorMessage(err) });
    }
  };

  // Acciones Títulos
  const abrirModalCrearTitulo = () => {
    if (!selectedGraduado) return;
    setEditingTitulacion(null);
    setFormTitulo({
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
    setEvidenciasArchivos({});
    setStepTitulo(1);
    setModalTituloOpen(true);
  };

  const abrirModalEditarTitulo = (t: Titulacion) => {
    setEditingTitulacion(t);
    setFormTitulo({
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
    if (t.id && selectedGraduado) {
      setEvidenciasArchivos({
        1: { name: `Cedula_${selectedGraduado.cedula || 'Titulado'}.pdf`, size: '1.4 MB' },
        2: { name: `Diploma_Bachiller_${selectedGraduado.carnet || 'MINED'}.pdf`, size: '2.1 MB' },
        3: { name: 'Certificado_Notas_Oficial.pdf', size: '3.8 MB' },
        7: { name: 'Acta_Defensa_Monografia.pdf', size: '1.9 MB' },
      });
    } else {
      setEvidenciasArchivos({});
    }
    setStepTitulo(1);
    setModalTituloOpen(true);
  };

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormTitulo((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormTitulo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const guardarTitulo = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGraduado) return;
    try {
      const payload = {
        ...formTitulo,
        graduado_id: selectedGraduado.id,
        titulo_obtenido: formTitulo.titulo_obtenido || formTitulo.carrera,
        fecha_titulacion: formTitulo.fecha_emision_titulo,
      };

      if (editingTitulacion) {
        await api(`/titulaciones/${editingTitulacion.id}`, { method: 'PUT', body: payload });
        setMsg({ kind: 'success', text: 'Título actualizado exitosamente.' });
      } else {
        await api('/titulaciones', { method: 'POST', body: payload });
        setMsg({ kind: 'success', text: 'Nuevo título registrado exitosamente al graduado.' });
      }
      setModalTituloOpen(false);
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
    <div className="graduados-container">
      {/* BARRA SUPERIOR ESTILO SETEC */}
      <div className="setec-header-bar">
        <h2>Graduados y Titulaciones</h2>
        {can('admin', 'operador') && (
          <button type="button" className="setec-btn-primary" onClick={abrirModalCrearGraduado}>
            + Registrar Nuevo Graduado
          </button>
        )}
      </div>

      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}

      {/* FILTROS DE BÚSQUEDA */}
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

      {/* TABLA PRINCIPAL DE GRADUADOS */}
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
                              <span>Cód. MINED : <b>{g.carnet}</b></span>
                            ) : (
                              <span className="muted">Sin documento</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons-group">
                              {can('admin', 'operador') && (
                                <button
                                  type="button"
                                  className="icon-btn btn-edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalEditarGraduado(g);
                                  }}
                                  title="Editar datos del graduado"
                                >
                                  ✏️
                                </button>
                              )}
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
                              {can('admin') && (
                                <button
                                  type="button"
                                  className="icon-btn btn-delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarGraduado(g);
                                  }}
                                  title="Eliminar graduado"
                                >
                                  🗑️
                                </button>
                              )}
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
              <input type="text" readOnly value={selectedGraduado.cedula || '—'} />
            </div>
            <div className="summary-field">
              <label>Código del MINED</label>
              <input type="text" readOnly value={selectedGraduado.carnet || '—'} />
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

          {/* Listado de Títulos */}
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
          💡 Seleccione un graduado de la tabla para visualizar sus títulos universitarios o registrar uno nuevo.
        </div>
      )}

      {/* === MODAL MULTI-PASO: CREAR / EDITAR GRADUADO === */}
      {modalGraduadoOpen && (
        <div className="setec-modal-backdrop">
          <div className="setec-modal" role="dialog" aria-labelledby="modal-graduado-title">
            <div className="modal-top-bar">
              <h3 id="modal-graduado-title">{editingGraduado ? 'Editar Graduado' : 'Crear Graduado'}</h3>
              <button type="button" className="close-x-btn" onClick={() => setModalGraduadoOpen(false)}>✕</button>
            </div>

            <div className="stepper-tabs">
              <div className={`step-tab ${stepGraduado === 1 ? 'active' : ''}`} onClick={() => setStepGraduado(1)}>
                <span>👤 Datos Personales</span>
              </div>
              <div className={`step-tab ${stepGraduado === 2 ? 'active' : ''}`} onClick={() => setStepGraduado(2)}>
                <span>@ Datos de Contacto</span>
              </div>
              <div className={`step-tab ${stepGraduado === 3 ? 'active' : ''}`} onClick={() => setStepGraduado(3)}>
                <span>🎓 Datos Académicos</span>
              </div>
            </div>

            <div className="modal-content-body">
              {stepGraduado === 1 && (
                <div className="step-content">
                  {/* Cuadro de Búsqueda API Académica Externa */}
                  {!editingGraduado && (
                    <div className="academic-search-box">
                      <div className="academic-search-header">
                        <strong>🌐 Consultar en API Académica Externa</strong>
                        <small className="muted">Autocompletar datos del estudiante por Cédula o Código del MINED</small>
                      </div>
                      <div className="academic-search-input-group">
                        <input
                          type="text"
                          placeholder="Ingrese Cédula (Ej. 441-230600-1010G) o Código del MINED..."
                          value={academicQuery}
                          onChange={(e) => setAcademicQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              consultarApiExterna();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn-academic-search"
                          onClick={() => consultarApiExterna()}
                          disabled={searchingAcademic}
                        >
                          {searchingAcademic ? 'Buscando...' : '🔍 Consultar API'}
                        </button>
                      </div>
                      {academicStatusMsg && (
                        <div className={`academic-badge-status status-${academicStatusMsg.kind}`}>
                          {academicStatusMsg.text}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Tipo de Identidad *</label>
                      <SearchableSelect
                        name="tipo_identidad"
                        value={formGraduado.tipo_identidad}
                        options={['Cédula de Identidad Nicaragüense', 'Pasaporte', 'Carné de Residente', 'INSS']}
                        onChange={(val) => handleGraduadoSelectChange('tipo_identidad', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Documento de Identidad *</label>
                      <input type="text" name="cedula" placeholder="Ej. 001-010190-0001A" value={formGraduado.cedula} onChange={handleGraduadoChange} required />
                    </div>
                    <div className="form-field">
                      <label>Sexo *</label>
                      <SearchableSelect
                        name="sexo"
                        value={formGraduado.sexo}
                        options={['Femenino', 'Masculino']}
                        onChange={(val) => handleGraduadoSelectChange('sexo', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Nombres *</label>
                      <input type="text" name="nombres" placeholder="Nombres del Titulado" value={formGraduado.nombres} onChange={handleGraduadoChange} required />
                    </div>
                    <div className="form-field">
                      <label>Apellidos *</label>
                      <input type="text" name="apellidos" placeholder="Apellidos del Titulado" value={formGraduado.apellidos} onChange={handleGraduadoChange} required />
                    </div>
                    <div className="form-field">
                      <label>País *</label>
                      <SearchableSelect
                        name="pais"
                        value={formGraduado.pais}
                        options={PAISES_DEL_MUNDO}
                        onChange={(val) => handleGraduadoSelectChange('pais', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Estado Civil *</label>
                      <SearchableSelect
                        name="estado_civil"
                        value={formGraduado.estado_civil}
                        options={['Soltero(a)', 'Casado(a)', 'Unión de Hecho', 'Divorciado(a)', 'Viudo(a)']}
                        onChange={(val) => handleGraduadoSelectChange('estado_civil', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Departamento Origen *</label>
                      <SearchableSelect
                        name="departamento_origen"
                        value={isPaisNicaragua ? formGraduado.departamento_origen : 'NO DEFINIDO'}
                        options={isPaisNicaragua ? LISTA_DEPARTAMENTOS_NICARAGUA : ['NO DEFINIDO']}
                        disabled={!isPaisNicaragua}
                        onChange={(val) => handleGraduadoSelectChange('departamento_origen', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Municipio Origen *</label>
                      <SearchableSelect
                        name="municipio_origen"
                        value={isPaisNicaragua ? formGraduado.municipio_origen : 'NO DEFINIDO'}
                        options={isPaisNicaragua ? getMunicipiosDeDepartamento(formGraduado.departamento_origen) : ['NO DEFINIDO']}
                        disabled={!isPaisNicaragua}
                        onChange={(val) => handleGraduadoSelectChange('municipio_origen', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Etnia *</label>
                      <SearchableSelect
                        name="etnia"
                        value={formGraduado.etnia}
                        options={['Mestizo', 'Miskito', 'Creole', 'Chorotega', 'Sumo / Mayangna', 'Rama', 'Garífuna', 'Otro']}
                        onChange={(val) => handleGraduadoSelectChange('etnia', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Departamento Residencia *</label>
                      <SearchableSelect
                        name="departamento_residencia"
                        value={formGraduado.departamento_residencia}
                        options={LISTA_DEPARTAMENTOS_NICARAGUA}
                        onChange={(val) => handleGraduadoSelectChange('departamento_residencia', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Municipio Residencia *</label>
                      <SearchableSelect
                        name="municipio_residencia"
                        value={formGraduado.municipio_residencia}
                        options={getMunicipiosDeDepartamento(formGraduado.departamento_residencia)}
                        onChange={(val) => handleGraduadoSelectChange('municipio_residencia', val)}
                      />
                    </div>
                    <div className="form-field col-span-3">
                      <label>Dirección de Residencia *</label>
                      <textarea name="direccion_residencia" rows={2} placeholder="Dirección de Residencia del Titulado" value={formGraduado.direccion_residencia} onChange={handleGraduadoChange}></textarea>
                    </div>
                  </div>
                </div>
              )}

              {stepGraduado === 2 && (
                <div className="step-content">
                  <div className="form-field" style={{ marginBottom: '1.5rem' }}>
                    <label>Correo Electrónico *</label>
                    <input type="email" name="email" placeholder="alguien@ejemplo.com" value={formGraduado.email} onChange={handleGraduadoChange} required />
                  </div>
                  <div className="setec-subbox">
                    <div className="subbox-header">
                      <h4>📞 Teléfonos del Titulado</h4>
                      <button type="button" className="btn-add-phone">+ Agregar Teléfono</button>
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
                            <SearchableSelect
                              name="linea_telefonica"
                              value={formGraduado.linea_telefonica}
                              options={['Claro', 'Tigo', 'Convencional', 'Otro']}
                              onChange={(val) => handleGraduadoSelectChange('linea_telefonica', val)}
                            />
                          </td>
                          <td>
                            <input type="text" name="telefono" placeholder="0000-0000" value={formGraduado.telefono} onChange={handleGraduadoChange} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" className="btn-trash" onClick={() => setFormGraduado((p) => ({ ...p, telefono: '' }))}>🗑️</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {stepGraduado === 3 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Año de Bachillerato *</label>
                      <input type="text" name="anio_bachillerato" placeholder="Ej. 2018" value={formGraduado.anio_bachillerato} onChange={handleGraduadoChange} />
                    </div>
                    <div className="form-field">
                      <label>Código del MINED *</label>
                      <input type="text" name="carnet" placeholder="Código de Estudiante emitido por el MINED" value={formGraduado.carnet} onChange={handleGraduadoChange} required />
                    </div>
                    <div className="form-field">
                      <label>Tipo de Bachillerato *</label>
                      <SearchableSelect
                        name="tipo_bachillerato"
                        value={formGraduado.tipo_bachillerato}
                        options={OPCIONES_TIPO_BACHILLERATO}
                        onChange={(val) => handleGraduadoSelectChange('tipo_bachillerato', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Turno del Bachillerato *</label>
                      <SearchableSelect
                        name="turno_bachillerato"
                        value={formGraduado.turno_bachillerato}
                        options={OPCIONES_TURNO_BACHILLERATO}
                        onChange={(val) => handleGraduadoSelectChange('turno_bachillerato', val)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Modalidad del Bachillerato *</label>
                      <SearchableSelect
                        name="modalidad_bachillerato"
                        value={formGraduado.modalidad_bachillerato}
                        options={OPCIONES_MODALIDAD_BACHILLERATO}
                        onChange={(val) => handleGraduadoSelectChange('modalidad_bachillerato', val)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-nav">
              <div className="nav-buttons-left">
                {stepGraduado > 1 && (
                  <button type="button" className="btn-stepper btn-prev" onClick={() => setStepGraduado((p) => (p - 1) as 1 | 2 | 3)}>Anterior</button>
                )}
                {stepGraduado < 3 ? (
                  <button type="button" className="btn-stepper btn-next" onClick={() => setStepGraduado((p) => (p + 1) as 1 | 2 | 3)}>Siguiente</button>
                ) : (
                  <button type="button" className="btn-stepper btn-save" onClick={() => guardarGraduado()}>💾 Guardar Graduado</button>
                )}
                <button type="button" className="btn-stepper btn-close" onClick={() => setModalGraduadoOpen(false)}>✕ Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL MULTI-PASO: CREAR / EDITAR TÍTULO === */}
      {modalTituloOpen && (
        <div className="setec-modal-backdrop">
          <div className="setec-modal" role="dialog" aria-labelledby="modal-titulo-title">
            <div className="modal-top-bar">
              <h3 id="modal-titulo-title">{editingTitulacion ? 'Editar Título' : 'Crear Título'}</h3>
              <button type="button" className="close-x-btn" onClick={() => setModalTituloOpen(false)}>✕</button>
            </div>

            <div className="stepper-tabs">
              <div className={`step-tab ${stepTitulo === 1 ? 'active' : ''}`} onClick={() => setStepTitulo(1)}>
                <span>🎓 Datos del Título</span>
              </div>
              <div className={`step-tab ${stepTitulo === 2 ? 'active' : ''}`} onClick={() => setStepTitulo(2)}>
                <span>ℹ️ Datos Adicionales</span>
              </div>
              <div className={`step-tab ${stepTitulo === 3 ? 'active' : ''}`} onClick={() => setStepTitulo(3)}>
                <span>🖼️ Evidencias del Trámite</span>
              </div>
            </div>

            <div className="modal-content-body">
              {stepTitulo === 1 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field col-span-3">
                      <label>Título Obtenido *</label>
                      <input type="text" name="titulo_obtenido" placeholder="Descripción del Título Obtenido" value={formTitulo.titulo_obtenido} onChange={handleTituloChange} required />
                    </div>
                    <div className="form-field">
                      <label>Año Inicio de Estudio *</label>
                      <input type="text" name="anio_inicio_estudio" placeholder="Ej. 2019" value={formTitulo.anio_inicio_estudio} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Año Fin de Estudio *</label>
                      <input type="text" name="anio_fin_estudio" placeholder="Ej. 2023" value={formTitulo.anio_fin_estudio} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Año de Graduación *</label>
                      <input type="text" name="anio_graduacion" placeholder="Ej. 2024" value={formTitulo.anio_graduacion} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Registrado No. *</label>
                      <input type="text" name="registrado_no" placeholder="Ej. 10294" value={formTitulo.registrado_no} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Folio *</label>
                      <input type="text" name="folio" placeholder="Ej. 45" value={formTitulo.folio} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Tomo del Registro del Título *</label>
                      <input type="text" name="tomo_registro" placeholder="Ej. III" value={formTitulo.tomo_registro} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>F. Emisión del Título *</label>
                      <input type="date" name="fecha_emision_titulo" value={formTitulo.fecha_emision_titulo} onChange={handleTituloChange} required />
                    </div>
                    <div className="form-field col-span-2">
                      <label>Sede *</label>
                      <SearchableSelect
                        options={['Sede Central - León', 'Sede Somoto', 'Sede Jinotega', 'Sede Managua', 'Sede Chinandega', 'Sede Estelí', 'Sede Matagalpa', 'Sede Juigalpa', 'Sede Boaco', 'Sede Rivas']}
                        value={formTitulo.sede}
                        onChange={(val) => handleTituloSelectChange('sede', val)}
                        placeholder="Seleccionar o buscar sede..."
                      />
                    </div>
                    <div className="form-field col-span-3">
                      <label>Carrera / Maestría / Especialidad *</label>
                      <input type="text" name="carrera" value={formTitulo.carrera} onChange={handleTituloChange} required />
                    </div>
                    <div className="form-field">
                      <label>Duración de la Carrera en años *</label>
                      <input type="text" name="duracion_anios" placeholder="Ej. 5 años" value={formTitulo.duracion_anios} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Número de Asignaturas *</label>
                      <input type="text" name="numero_asignaturas" placeholder="Ej. 54" value={formTitulo.numero_asignaturas} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Programa Especial *</label>
                      <SearchableSelect
                        options={['Ninguno', 'Universidad en el Campo', 'Profesionalización', 'Por Encuentro', 'Programa Sabatino']}
                        value={formTitulo.programa_especial}
                        onChange={(val) => handleTituloSelectChange('programa_especial', val)}
                        placeholder="Seleccionar o buscar programa..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {stepTitulo === 2 && (
                <div className="step-content">
                  <div className="form-grid-3">
                    <div className="form-field col-span-3">
                      <label>Forma Culminación Estudio *</label>
                      <SearchableSelect
                        options={['Monografía', 'Examen de Grado', 'Curso de Graduación', 'Práctica Profesional', 'Tesis']}
                        value={formTitulo.forma_culminacion}
                        onChange={(val) => handleTituloSelectChange('forma_culminacion', val)}
                        placeholder="Seleccionar o buscar forma de culminación..."
                      />
                    </div>
                    <div className="form-field">
                      <label>Número de LA GACETA *</label>
                      <input type="text" name="numero_gaceta" placeholder="Ej. 182" value={formTitulo.numero_gaceta} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>Página LA GACETA *</label>
                      <input type="text" name="pagina_gaceta" placeholder="Ej. 4510" value={formTitulo.pagina_gaceta} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field">
                      <label>F. de LA GACETA *</label>
                      <input type="date" name="fecha_gaceta" value={formTitulo.fecha_gaceta} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field" style={{ justifyContent: 'center' }}>
                      <label>Acceso a Internet *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <input type="checkbox" name="acceso_internet" checked={formTitulo.acceso_internet} onChange={handleTituloChange} style={{ width: 'auto', minHeight: 'auto' }} />
                        <span>{formTitulo.acceso_internet ? 'Sí' : 'No'}</span>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Tipo Acceso a Internet *</label>
                      <SearchableSelect
                        options={['Sin Especificar', 'Fibra Óptica / Cable', 'Móvil / Datos']}
                        value={formTitulo.tipo_acceso_internet}
                        onChange={(val) => handleTituloSelectChange('tipo_acceso_internet', val)}
                        placeholder="Tipo de conexión..."
                      />
                    </div>
                    <div className="form-field">
                      <label>Empresa Acceso a Internet *</label>
                      <SearchableSelect
                        options={['Sin Especificar', 'Claro', 'Tigo', 'IBW']}
                        value={formTitulo.empresa_acceso_internet}
                        onChange={(val) => handleTituloSelectChange('empresa_acceso_internet', val)}
                        placeholder="Proveedor..."
                      />
                    </div>
                    <div className="form-field">
                      <label>Fecha de Registro *</label>
                      <input type="date" name="fecha_registro_setec" value={formTitulo.fecha_registro_setec} onChange={handleTituloChange} />
                    </div>
                    <div className="form-field col-span-2">
                      <label>Registrador *</label>
                      <input type="text" name="registrador" disabled value={formTitulo.registrador} />
                    </div>
                  </div>
                </div>
              )}

              {stepTitulo === 3 && (
                <div className="step-content">
                  <div className="evidencias-container">
                    {/* Header Resumen del Expediente */}
                    <div className="evidencias-header-card">
                      <div className="evidencias-header-info">
                        <h4>📁 Expediente Digital de Evidencias SETEC</h4>
                        <p>Adjunte los documentos de respaldo para cotejo y validación del título. Formatos: PDF, JPG, PNG (máx. 10 MB).</p>
                      </div>
                      <div className="evidencias-progress-pill">
                        <div className={`evidencias-badge-counter ${Object.keys(evidenciasArchivos).length === REQUISITOS_EVIDENCIAS.length ? 'complete' : ''}`}>
                          {Object.keys(evidenciasArchivos).length} de {REQUISITOS_EVIDENCIAS.length} Requisitos Adjuntos
                        </div>
                        <div className="evidencias-bar-track">
                          <div
                            className="evidencias-bar-fill"
                            style={{
                              width: `${Math.round((Object.keys(evidenciasArchivos).length / REQUISITOS_EVIDENCIAS.length) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tabla Moderna de Requisitos */}
                    <table className="evidencias-table-modern">
                      <thead>
                        <tr>
                          <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                          <th>Requisito Documental</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>Estado</th>
                          <th style={{ textAlign: 'right' }}>Documento / Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REQUISITOS_EVIDENCIAS.map((req) => {
                          const archivo = evidenciasArchivos[req.id];
                          const inputId = `file-evidencia-${req.id}`;
                          return (
                            <tr key={req.id}>
                              <td style={{ textAlign: 'center' }}>
                                <span className="evidencia-num-badge">{req.id}</span>
                              </td>
                              <td>
                                <div className="evidencia-req-title">
                                  <span>{req.nombre}</span>
                                  <span
                                    className={`evidencia-tag-req tag-${
                                      req.categoria === 'General'
                                        ? 'general'
                                        : req.categoria === 'Posgrado'
                                        ? 'posgrado'
                                        : 'pregrado'
                                    }`}
                                  >
                                    {req.categoria}
                                  </span>
                                </div>
                                <div className="evidencia-req-desc">{req.descripcion}</div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {archivo ? (
                                  <span
                                    className="badge"
                                    style={{
                                      background: '#dcfce7',
                                      color: '#15803d',
                                      border: '1px solid #86efac',
                                      fontWeight: 600,
                                      fontSize: '0.74rem',
                                    }}
                                  >
                                    ✓ Adjuntado
                                  </span>
                                ) : (
                                  <span
                                    className="badge"
                                    style={{
                                      background: '#f1f5f9',
                                      color: '#64748b',
                                      border: '1px solid #cbd5e1',
                                      fontWeight: 500,
                                      fontSize: '0.74rem',
                                    }}
                                  >
                                    ⏳ Pendiente
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="evidencia-action-cell">
                                  <input
                                    type="file"
                                    id={inputId}
                                    style={{ display: 'none' }}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleEvidenciaFileChange(req.id, e)}
                                  />
                                  {archivo ? (
                                    <>
                                      <div className="evidencia-file-info" title={archivo.name}>
                                        <span style={{ fontSize: '0.95rem' }}>📄</span>
                                        <span className="evidencia-file-name">{archivo.name}</span>
                                        <span className="evidencia-file-size">({archivo.size})</span>
                                        <button
                                          type="button"
                                          className="btn-remove-file"
                                          title="Quitar archivo adjunto"
                                          onClick={() => handleRemoveEvidencia(req.id)}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      <label
                                        htmlFor={inputId}
                                        className="btn-adjuntar btn-adjuntar-success"
                                        title="Reemplazar archivo"
                                      >
                                        🔄 Cambiar
                                      </label>
                                    </>
                                  ) : (
                                    <label
                                      htmlFor={inputId}
                                      className="btn-adjuntar"
                                      title="Seleccionar archivo desde el equipo"
                                    >
                                      📁 Adjuntar Archivo
                                    </label>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-nav">
              <div className="nav-buttons-left">
                {stepTitulo > 1 && (
                  <button type="button" className="btn-stepper btn-prev" onClick={() => setStepTitulo((p) => (p - 1) as 1 | 2 | 3)}>Anterior</button>
                )}
                {stepTitulo < 3 ? (
                  <button type="button" className="btn-stepper btn-next" onClick={() => setStepTitulo((p) => (p + 1) as 1 | 2 | 3)}>Siguiente</button>
                ) : (
                  <button type="button" className="btn-stepper btn-save" onClick={() => guardarTitulo()}>💾 Guardar Título</button>
                )}
                <button type="button" className="btn-stepper btn-close" onClick={() => setModalTituloOpen(false)}>✕ Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
