import { Link } from 'react-router-dom';
import ListPage from '../components/ListPage';
import { Badge } from '../components/ui';
import type { TituloFisico } from '../api/types';

export default function Titulos() {
  return (
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
  );
}