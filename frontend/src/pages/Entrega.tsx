import { useState } from 'react';
import ListPage from '../components/ListPage';
import { Alert, Badge } from '../components/ui';
import { api } from '../api/client';
import { errorMessage } from '../hooks/useApi';
import { useAuth } from '../auth/AuthContext';
import type { TituloFisico } from '../api/types';

export default function Entrega() {
  const { can } = useAuth();
  const [version, setVersion] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  const entregar = async (t: TituloFisico) => {
    if (!confirm(`¿Entregar el título ${t.numero_titulo}?`)) return;
    try {
      await api(`/entrega/${t.id}`, { method: 'POST', body: {} });
      setMsg({ kind: 'success', text: 'Título entregado.' });
      setVersion((v) => v + 1);
    } catch (e) { setMsg({ kind: 'error', text: errorMessage(e) }); }
  };

  return (
    <>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      <ListPage<TituloFisico>
        key={version}
        title="Entrega de títulos"
        path="/entrega"
        searchable={false}
        headers={['N.º título', 'Graduado', 'Ubicación', '']}
        row={(t) => [t.numero_titulo, t.titulacion?.graduado?.nombre_completo, <Badge value={t.ubicacion_actual} />,
          can('admin', 'operador') ? <button onClick={() => entregar(t)}>Entregar</button> : null]}
      />
    </>
  );
}