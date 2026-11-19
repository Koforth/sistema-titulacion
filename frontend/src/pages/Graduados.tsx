import { useState, type FormEvent } from 'react';
import ListPage from '../components/ListPage';
import { Alert } from '../components/ui';
import { api } from '../api/client';
import { errorMessage } from '../hooks/useApi';
import { useAuth } from '../auth/AuthContext';
import type { Graduado } from '../api/types';

export default function Graduados() {
  const { can } = useAuth();
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [version, setVersion] = useState(0);

  const crear = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await api('/graduados', { method: 'POST', body: Object.fromEntries(f) });
      setMsg({ kind: 'success', text: 'Graduado creado.' });
      setShow(false);
      setVersion((v) => v + 1);
    } catch (err) { setMsg({ kind: 'error', text: errorMessage(err) }); }
  };

  const eliminar = async (g: Graduado) => {
    if (!confirm(`¿Eliminar a ${g.nombre_completo}?`)) return;
    try { await api(`/graduados/${g.id}`, { method: 'DELETE' }); setVersion((v) => v + 1); }
    catch (err) { setMsg({ kind: 'error', text: errorMessage(err) }); }
  };

  return (
    <>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      {show && can('admin', 'operador') && (
        <form className="card" onSubmit={crear}>
          <label>Nombre completo<input name="nombre_completo" required /></label>
          <label>Carnet<input name="carnet" /></label>
          <label>Cédula<input name="cedula" /></label>
          <label>Correo<input name="email" type="email" /></label>
          <label>Teléfono<input name="telefono" /></label>
          <button type="submit">Guardar</button>
        </form>
      )}
      <ListPage<Graduado>
        key={version}
        title="Graduados"
        path="/graduados"
        headers={['Nombre', 'Carnet', 'Cédula', 'Titulaciones', '']}
        row={(g) => [g.nombre_completo, g.carnet, g.cedula, g.titulaciones_count,
          can('admin') ? <button onClick={() => eliminar(g)}>Eliminar</button> : null]}
        actions={can('admin', 'operador') ? <button onClick={() => setShow(!show)}>Nuevo graduado</button> : null}
      />
    </>
  );
}