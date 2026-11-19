import ListPage from '../components/ListPage';
import { Badge, fecha } from '../components/ui';
import type { Titulacion } from '../api/types';

export default function Titulaciones() {
  return (
    <ListPage<Titulacion>
      title="Titulaciones"
      path="/titulaciones"
      headers={['Graduado', 'Carrera', 'Modalidad', 'Fecha', 'Título físico']}
      row={(t) => [t.graduado?.nombre_completo, t.carrera, t.modalidad, fecha(t.fecha_titulacion),
        t.titulo_fisico ? <Badge value={t.titulo_fisico.ubicacion_actual} /> : '—']}
    />
  );
}