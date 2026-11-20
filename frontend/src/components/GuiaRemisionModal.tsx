import type { Lote, TituloFisico } from '../api/types';
import { fecha } from './ui';

interface GuiaRemisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lote?: Lote | null;
  tituloIndividual?: TituloFisico | null;
  tipoTrámite: 'IMPRENTA_SALIDA' | 'IMPRENTA_RETORNO' | 'SETEC_SALIDA' | 'SETEC_RETORNO' | 'ENTREGA_GRADUADO';
}

export default function GuiaRemisionModal({
  isOpen,
  onClose,
  lote,
  tituloIndividual,
  tipoTrámite,
}: GuiaRemisionModalProps) {
  if (!isOpen) return null;

  const getTituloTramite = () => {
    switch (tipoTrámite) {
      case 'IMPRENTA_SALIDA':
        return 'GUÍA DE REMISIÓN · SALIDA A IMPRENTA (MANAGUA)';
      case 'IMPRENTA_RETORNO':
        return 'ACTA DE RECEPCIÓN · RETORNO DE IMPRENTA (LEÓN)';
      case 'SETEC_SALIDA':
        return 'GUÍA DE REMISIÓN · SALIDA A CERTIFICACIÓN SETEC';
      case 'SETEC_RETORNO':
        return 'ACTA DE RECEPCIÓN · RETORNO DE CERTIFICACIÓN SETEC';
      case 'ENTREGA_GRADUADO':
        return 'ACTA OFICIAL DE ENTREGA DE TÍTULO AL GRADUADO';
    }
  };

  const getDestino = () => {
    switch (tipoTrámite) {
      case 'IMPRENTA_SALIDA':
        return 'Imprenta Central UNCPGGL · Managua';
      case 'IMPRENTA_RETORNO':
        return 'Sede Central UNCPGGL · León (Registro Académico)';
      case 'SETEC_SALIDA':
        return 'Secretaría Técnica para Atención a las Universidades (SETEC) · Managua';
      case 'SETEC_RETORNO':
        return 'Sede Central UNCPGGL · León (Registro Académico)';
      case 'ENTREGA_GRADUADO':
        return 'Ventanilla de Registro y Control Académico';
    }
  };

  const titulos = lote?.detalle?.map((d) => d.titulo_fisico ?? d.tituloFisico).filter(Boolean) as TituloFisico[]
    ?? (tituloIndividual ? [tituloIndividual] : []);

  const totalTitulos = titulos.length;
  const fechaHoraActual = new Date().toLocaleString('es-NI', {
    dateStyle: 'long',
    timeStyle: 'medium',
  });

  return (
    <div className="setec-modal-backdrop" onClick={onClose}>
      <div
        className="setec-modal printable-remision"
        style={{ maxWidth: '850px', background: '#fff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de pantalla (no se imprime) */}
        <div className="modal-top-bar no-print">
          <h3>📄 {getTituloTramite()}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-stepper btn-save no-print"
              style={{ minHeight: '30px', fontSize: '0.82rem', padding: '0 0.8rem' }}
              onClick={() => window.print()}
            >
              🖨️ Imprimir / Guardar PDF
            </button>
            <button type="button" className="close-x-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Contenido imprimible */}
        <div className="modal-content-body print-area" style={{ padding: '2rem 2.2rem', color: '#111' }}>
          {/* Encabezado Oficial UNCPGGL */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #7a1c1c',
            paddingBottom: '1rem',
            marginBottom: '1.2rem',
          }}>
            <img
              src="/logo-uncpggl.png"
              alt="Escudo UNCPGGL"
              style={{ height: '78px', width: 'auto' }}
            />
            <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.12rem', color: '#7a1c1c', fontWeight: 800, letterSpacing: '0.04em' }}>
                UNIVERSIDAD NACIONAL PADRE GASPAR GARCÍA LAVIANA
              </h2>
              <div style={{ fontStyle: 'italic', fontSize: '0.82rem', color: '#7a5a05', fontWeight: 600 }}>
                ¡Fe y Amor por mi pueblo nicaragüense!
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '2px' }}>
                Dirección General de Registro y Control Académico
              </div>
              <div style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1f2937',
                marginTop: '6px',
                textTransform: 'uppercase',
                background: '#f8fafc',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                border: '1px solid #dfe3e8',
              }}>
                {getTituloTramite()}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#4b5563', minWidth: '130px' }}>
              <div><strong>N.º Lote:</strong> {lote?.numero_lote || 'INDIVIDUAL'}</div>
              <div><strong>Fecha:</strong> {fecha(lote?.fecha_envio || lote?.created_at || new Date().toISOString())}</div>
              <div><strong>Hora:</strong> {new Date().toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          {/* Metadatos del Traslado */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.8rem',
            background: '#fafafa',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '0.8rem 1rem',
            marginBottom: '1.2rem',
            fontSize: '0.84rem',
          }}>
            <div>
              <div><strong>Origen:</strong> Sede Central León (Registro y Archivo)</div>
              <div>
                <strong>Responsable Emisor:</strong> {lote?.responsable_envio?.name || lote?.responsableEnvio?.name || 'Operador Autorizado'}
              </div>
              <div><strong>Total Títulos Remitidos:</strong> <span style={{ color: '#7a1c1c', fontWeight: 700 }}>{totalTitulos} documento(s)</span></div>
            </div>
            <div>
              <div><strong>Destino:</strong> {getDestino()}</div>
              <div>
                <strong>Recepción / Custodia:</strong> {lote?.responsable_recepcion?.name || lote?.responsableRecepcion?.name || 'Personal Encargado de Recepción'}
              </div>
              <div><strong>Fecha de Impresión de Guía:</strong> {fechaHoraActual}</div>
            </div>
            {lote?.observaciones && (
              <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #d1d5db', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                <strong>Observaciones / Instrucciones de Envío:</strong> {lote.observaciones}
              </div>
            )}
          </div>

          {/* Tabla de Títulos */}
          <div style={{ marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#7a1c1c', color: '#fff' }}>
                  <th style={{ padding: '6px 8px', border: '1px solid #601414', width: '30px', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #601414', textAlign: 'left' }}>N.º Título</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #601414', textAlign: 'left' }}>Graduado / Cédula</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #601414', textAlign: 'left' }}>Carrera / Programa</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #601414', textAlign: 'center' }}>Lib/Tom/Fol</th>
                  <th style={{ padding: '6px 8px', border: '1px solid #601414', textAlign: 'center' }}>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {titulos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                      No se registraron títulos para esta guía.
                    </td>
                  </tr>
                ) : (
                  titulos.map((t, idx) => (
                    <tr key={t.id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '5px 8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '5px 8px', border: '1px solid #e5e7eb', fontWeight: 700, color: '#7a1c1c' }}>
                        {t.numero_titulo || '—'}
                      </td>
                      <td style={{ padding: '5px 8px', border: '1px solid #e5e7eb' }}>
                        <div><strong>{t.titulacion?.graduado?.nombre_completo || '—'}</strong></div>
                        <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                          {t.titulacion?.graduado?.cedula || t.titulacion?.graduado?.carnet || 'Sin doc'}
                        </div>
                      </td>
                      <td style={{ padding: '5px 8px', border: '1px solid #e5e7eb' }}>
                        {t.titulacion?.carrera || '—'}
                      </td>
                      <td style={{ padding: '5px 8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        {[t.libro, t.tomo, t.folio].filter(Boolean).join('/') || '—'}
                      </td>
                      <td style={{ padding: '5px 8px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 600 }}>
                        {t.ubicacion_actual || 'LEON'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Declaración Legal de Custodia */}
          <div style={{
            fontSize: '0.78rem',
            color: '#4b5563',
            lineHeight: 1.5,
            borderLeft: '3px solid #7a1c1c',
            paddingLeft: '0.8rem',
            marginBottom: '2.5rem',
          }}>
            <strong>Certificación de Custodia Documental:</strong> Se hace constar formalmente el traspaso y custodia de los títulos
            físicos oficiales detallados en la presente guía, en estricto cumplimiento de la normativa institucional de la UNCPGGL y las
            disposiciones de seguridad documental y auditoría de la SETEC. Toda manipulación o traslado queda bajo responsabilidad
            del custodio firmante.
          </div>

          {/* Firmas y Sellos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginTop: '2rem',
            paddingTop: '1rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #111', height: '55px', marginBottom: '8px' }}></div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>ENTREGADO POR (CUSTODIO EMISOR)</div>
              <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>Firma, Cédula y Sello</div>
              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '2px' }}>
                {lote?.responsable_envio?.name || lote?.responsableEnvio?.name || 'Nombre y Firma'}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #111', height: '55px', marginBottom: '8px' }}></div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>RECIBIDO POR (CUSTODIO RECEPTOR)</div>
              <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>Firma, Cédula y Sello de Recepción</div>
              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '2px' }}>
                {lote?.responsable_recepcion?.name || lote?.responsableRecepcion?.name || 'Nombre y Firma'}
              </div>
            </div>
          </div>
        </div>

        {/* Pie de pantalla */}
        <div className="modal-footer-nav no-print" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Documento generado por SIGTU · UNCPGGL
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-stepper btn-save"
              onClick={() => window.print()}
            >
              🖨️ Imprimir / Guardar PDF
            </button>
            <button type="button" className="btn-stepper btn-close" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
