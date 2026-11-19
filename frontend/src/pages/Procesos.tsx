import { Link } from 'react-router-dom';
import ListPage from '../components/ListPage';
import type { Proceso } from '../api/types';

export default function Procesos() {
  return (
    <ListPage<Proceso>
      title="Procesos de titulación"
      path="/procesos-titulo"
      headers={['Graduado', 'Carrera', 'Estado']}
      row={(p) => [
        p.titulacion?.titulo_fisico
          ? <Link to={`/titulos/${p.titulacion.titulo_fisico.id}`}>{p.titulacion.graduado?.nombre_completo}</Link>
          : p.titulacion?.graduado?.nombre_completo,
        p.titulacion?.carrera,
        p.pendiente ? 'Pendiente' : 'Finalizado',
      ]}
    />
  );
}