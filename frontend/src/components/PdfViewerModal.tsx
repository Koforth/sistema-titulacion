import React from 'react';
import type { EvidenciaDocumental, TituloPublico } from '../api/types';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidencia: EvidenciaDocumental | null;
  titulo: TituloPublico;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  evidencia,
  titulo,
}: PdfViewerModalProps) {
  if (!isOpen || !evidencia) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generación de descarga simulada de documento con texto informativo
    const content = `================================================================================
REPÚBLICA DE NICARAGUA · SETEC
UNIVERSIDAD NACIONAL COMANDANTE PADRE GASPAR GARCÍA LAVIANA
SECRETARÍA GENERAL · DIRECCIÓN DE REGISTRO Y TITULACIÓN
================================================================================

DOCUMENTO DE EVIDENCIA OFICIAL COTEJADO: ${evidencia.requisito.toUpperCase()}
CATEGORÍA: ${evidencia.categoria}
ARCHIVO DE REGISTRO: ${evidencia.nombre_archivo}

DATOS DEL TITULADO:
- Graduado: ${titulo.graduado || 'Graduado Registrado'}
- Documento de Identidad: ${titulo.cedula_enmascarada || 'Verificado'}
- Carrera / Programa: ${titulo.carrera || '—'}
- Título Obtenido: ${titulo.titulo_obtenido || titulo.carrera || '—'}
- Sede: ${titulo.sede || 'Sede Central - León'}
- N.º Registro SETEC: ${titulo.numero_titulo}
- Tomo / Folio: Tomo ${titulo.tomo || 'I'} / Folio ${titulo.folio || '—'}
- Fecha de Emisión: ${titulo.fecha_emision_titulo || '—'}

SELLO DE SEGURIDAD DIGITAL: ${titulo.sello_seguridad || 'UNCPGGL-OFFICIAL'}
IDENTIFICADOR ÚNICO (UUID): ${titulo.uuid}
FECHA Y HORA DE CONSULTA: ${titulo.fecha_consulta || new Date().toLocaleString()}

AVISO LEGAL:
La presente copia electrónica certifica que el documento físico y digital
reposa archivado en el expediente oficial de titulación de esta Universidad,
debidamente validado para efectos legales, académicos y laborales.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = evidencia.nombre_archivo.replace(/\.pdf$/i, '') + '_Oficial_UNCPGGL.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Contenido temático según el tipo de evidencia
  const renderDetallesDocumento = () => {
    switch (evidencia.id) {
      case 1: // Cédula de Identidad
        return (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Cotejo de Identidad Ciudadana:</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569' }}>
              <li>Documento: Cédula de Identidad Ciudadana Nicaragüense</li>
              <li>Titular: <b>{titulo.graduado}</b></li>
              <li>Identificador Protegido: <b>{titulo.cedula_enmascarada || '001-******-0001A'}</b></li>
              <li>Estado Registral: Verificado y confrontado con padrón oficial institucional.</li>
            </ul>
          </div>
        );
      case 2: // Diploma de Bachiller
        return (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Antecedentes Académicos de Educación Media:</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569' }}>
              <li>Grado Previo: <b>Bachiller en Ciencias y Letras</b></li>
              <li>Emisor Oficial: Ministerio de Educación (MINED) · República de Nicaragua</li>
              <li>Estatus: Título de Bachillerato legalizado y registrado en expediente de ingreso.</li>
            </ul>
          </div>
        );
      case 3: // Certificado de Notas
        return (
          <div>
            <p style={{ margin: '0 0 0.6rem 0', fontWeight: 600 }}>Certificación de Calificaciones Oficiales:</p>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'left' }}>Área / Ciclo</th>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>Asignaturas</th>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>Promedio</th>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>Condición</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #f1f5f9' }}>Formación Básica General</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>18 Asignaturas</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>88.5 / 100</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', color: '#15803d', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Aprobado</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #f1f5f9' }}>Especialidad Profesional</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>28 Asignaturas</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>91.2 / 100</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', color: '#15803d', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>Aprobado</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0.5rem' }}>Prácticas y Culminación</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>8 Asignaturas</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>94.0 / 100</td>
                  <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center', color: '#15803d', fontWeight: 600 }}>Aprobado</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 7: // Acta de Defensa
        return (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Acta Oficial de Defensa y Sustentación:</p>
            <p style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>
              En la ciudad de León, ante el Tribunal Examinador Universitario legalmente constituido, el sustentante <b>{titulo.graduado}</b> defendió satisfactoriamente su trabajo de culminación de estudios para optar al grado oficial de <b>{titulo.titulo_obtenido || titulo.carrera}</b>, obteniendo la calificación de <b>SOBRESALIENTE</b>.
            </p>
          </div>
        );
      case 8: // La Gaceta
        return (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Publicación en Diario Oficial La Gaceta:</p>
            <p style={{ margin: 0, color: '#475569' }}>
              Certificación de inserción pública conforme a la Ley de Títulos de la República de Nicaragua. Consta inscripción legal con efecto erga omnes para el libre ejercicio profesional en el territorio nacional e internacional.
            </p>
          </div>
        );
      default:
        return (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.3rem 0', fontWeight: 600 }}>Constancia de Registro Documental:</p>
            <p style={{ margin: 0, color: '#475569' }}>
              El presente documento ({evidencia.requisito}) fue debidamente validado, sellado y archivado de forma permanente en la carpeta institucional de graduación bajo custodia de Secretaría General.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="pdf-viewer-backdrop" role="dialog" aria-modal="true">
      <div className="pdf-viewer-modal">
        {/* Barra Superior del Visor */}
        <div className="pdf-viewer-topbar">
          <div className="pdf-viewer-title">
            <span style={{ fontSize: '1.2rem' }}>{evidencia.icono}</span>
            <span>{evidencia.requisito} — {evidencia.nombre_archivo}</span>
          </div>
          <div className="pdf-viewer-actions">
            <button
              type="button"
              className="btn-pdf-action"
              onClick={handlePrint}
              title="Imprimir documento oficial"
            >
              🖨️ Imprimir
            </button>
            <button
              type="button"
              className="btn-pdf-action"
              onClick={handleDownload}
              title="Descargar copia certificada"
            >
              ⬇️ Descargar
            </button>
            <button
              type="button"
              className="btn-pdf-close"
              onClick={onClose}
              title="Cerrar visor"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Hoja de Representación del Documento PDF */}
        <div className="pdf-viewer-content">
          <div className="pdf-document-sheet">
            {/* Marca de agua de seguridad */}
            <div className="pdf-sheet-watermark">
              COPIA DE CONSULTA PÚBLICA · SETEC
            </div>

            {/* Cabecera del Documento */}
            <div>
              <div className="pdf-sheet-header">
                <img
                  src="/logo-uncpggl.png"
                  alt="Escudo UNCPGGL"
                  style={{ height: '65px', width: 'auto', objectFit: 'contain', marginBottom: '0.3rem' }}
                />
                <h3>UNIVERSIDAD NACIONAL COMANDANTE PADRE GASPAR GARCÍA LAVIANA</h3>
                <p>República de Nicaragua · SETEC · Secretaría General de Registro</p>
              </div>

              <div className="pdf-sheet-title-badge">
                <h2>DOCUMENTO OFICIAL DE RESPALDO: {evidencia.requisito.toUpperCase()}</h2>
              </div>

              {/* Cuerpo del Documento */}
              <div className="pdf-sheet-body-content">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.8rem', background: '#fafafa', padding: '0.75rem', borderRadius: '6px' }}>
                  <div><strong>Titulado(a):</strong> {titulo.graduado}</div>
                  <div><strong>Documento:</strong> {titulo.cedula_enmascarada || 'Identidad Verificada'}</div>
                  <div><strong>Carrera / Grado:</strong> {titulo.carrera}</div>
                  <div><strong>N.º Registro Título:</strong> {titulo.numero_titulo}</div>
                  <div><strong>Sede Universitaria:</strong> {titulo.sede || 'Sede Central - León'}</div>
                  <div><strong>Libro / Tomo / Folio:</strong> Tomo {titulo.tomo || 'I'} / Folio {titulo.folio || '—'}</div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  {renderDetallesDocumento()}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  * El presente archivo digital forma parte integral del legajo físico de titulación resguardado conforme al marco regulatorio de SETEC y las normas universitarias nacionales.
                </div>
              </div>
            </div>

            {/* Pie de firmas y sello */}
            <div className="pdf-sheet-footer-signatures">
              <div className="pdf-signature-line">
                Dirección de Registro Académico<br />
                <small style={{ fontSize: '0.68rem', color: '#64748b' }}>Firma y Sello Oficial</small>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                <div><strong>Sello Hash:</strong> <code>{titulo.sello_seguridad || 'UNCPGGL-CERT'}</code></div>
                <div>Código de Verificación SETEC</div>
              </div>

              <div className="pdf-signature-line">
                Secretaría General UNCPGGL<br />
                <small style={{ fontSize: '0.68rem', color: '#64748b' }}>Legalización Institucional</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
