import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Alert, Badge, Loading } from '../components/ui';
import { errorMessage, useApi } from '../hooks/useApi';
import type { TituloPublico } from '../api/types';

export function ConsultaHome() {
  const { data: est } = useApi<{ titulos_emitidos: number; total_registrados: number }>('/publico/estadisticas');
  const [q, setQ] = useState('');
  const [res, setRes] = useState<TituloPublico[] | null>(null);
  const [error, setError] = useState('');

  const buscar = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try { setRes((await api<{ data: TituloPublico[] }>(`/publico/buscar?q=${encodeURIComponent(q)}`)).data); }
    catch (err) { setRes(null); setError(errorMessage(err)); }
  };

  return (
    <div className="card">
      <h1>Consulta pública de títulos</h1>
      {est && <p className="muted">{est.titulos_emitidos} títulos emitidos de {est.total_registrados} registrados</p>}
      <form onSubmit={buscar} className="inline">
        <input placeholder="Número de título o nombre (mín. 3 letras)" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit">Buscar</button>
      </form>
      {error && <Alert>{error}</Alert>}
      {res && (res.length === 0 ? <p>Sin resultados.</p> : (
        <ul>{res.map((t) => <li key={t.uuid}>{t.numero_titulo} — {t.graduado} — {t.carrera}</li>)}</ul>
      ))}
      <p><a href="/login">Acceso al sistema</a></p>
    </div>
  );
}

export function Verificar() {
  const { uuid } = useParams();
  const { data, error, loading } = useApi<{ data: TituloPublico }>(`/publico/verificar/${uuid}`);
  if (loading) return <Loading />;
  if (error || !data) return <Alert>Título no encontrado.</Alert>;
  const t = data.data;
  return (
    <div className="card">
      <h1>Verificación de título</h1>
      <p><b>N.º:</b> {t.numero_titulo} <Badge value={t.estado} /></p>
      <p><b>Graduado:</b> {t.graduado}</p>
      <p><b>Carrera:</b> {t.carrera}</p>
    </div>
  );
}