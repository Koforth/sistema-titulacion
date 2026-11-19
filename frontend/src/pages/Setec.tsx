import ListPage from '../components/ListPage';
import { Badge, fecha } from '../components/ui';
import type { Lote } from '../api/types';

export default function Setec() {
  return (
    <ListPage<Lote>
      title="Lotes SETEC"
      path="/setec"
      searchable={false}
      headers={['Lote', 'Fecha', 'Títulos', 'Estado']}
      row={(l) => [l.numero_lote, fecha(l.created_at), l.detalle?.length ?? 0, <Badge value={l.estado} />]}
    />
  );
}