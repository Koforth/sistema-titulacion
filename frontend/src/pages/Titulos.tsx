import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListPage from '../components/ListPage';
import { Badge } from '../components/ui';
import type { TituloFisico } from '../api/types';
import QrScannerModal from '../components/QrScannerModal';
import { api, type Page } from '../api/client';

export default function Titulos() {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan = async (code: string) => {
    try {
      const res = await api<Page<TituloFisico>>(`/titulos-fisicos?q=${encodeURIComponent(code)}`);
      if (res.data && res.data.length > 0) {
        navigate(`/titulos/${res.data[0].id}`);
      } else {
        alert(`No se encontró ningún título con el código: ${code}`);
      }
    } catch {
      alert(`No se pudo consultar el título escaneado: ${code}`);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-2.5rem', position: 'relative', zIndex: 10 }}>
        <button
          type="button"
          className="btn-search"
          style={{ background: 'var(--gold)', color: '#2b1d00', fontWeight: 700, minHeight: '32px', fontSize: '0.82rem' }}
          onClick={() => setIsScannerOpen(true)}
        >
          📱 Escanear con Teléfono Móvil
        </button>
      </div>

      <ListPage<TituloFisico>
        title="Títulos físicos"
        path="/titulos-fisicos"
        headers={['N.º título', 'Graduado', 'Libro/Tomo/Folio', 'Ubicación']}
        row={(t) => [
          <Link to={`/titulos/${t.id}`}>{t.numero_titulo}</Link>,
          t.titulacion?.graduado?.nombre_completo,
          [t.libro, t.tomo, t.folio].filter(Boolean).join(' / ') || '—',
          <Badge value={t.ubicacion_actual} />,
        ]}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
        title="Escanear Título Físico"
      />
    </>
  );
}
