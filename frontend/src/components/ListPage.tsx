import { useState, type ReactNode } from 'react';
import type { Page } from '../api/client';
import { Alert, Loading, Pager } from './ui';
import { useApi } from '../hooks/useApi';

interface Props<T> {
  title: string;
  path: string;
  searchable?: boolean;
  headers: string[];
  row: (item: T) => ReactNode[];
  actions?: ReactNode;
}

/** Listado paginado con búsqueda, reutilizable por todos los módulos. */
export default function ListPage<T extends { id: number }>({ title, path, searchable = true, headers, row, actions }: Props<T>) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const sep = path.includes('?') ? '&' : '?';
  const { data, error, loading } = useApi<Page<T>>(`${path}${sep}page=${page}&q=${encodeURIComponent(q)}`);

  return (
    <section>
      <div className="toolbar"><h1>{title}</h1>{actions}</div>
      {searchable && (
        <input className="search" placeholder="Buscar…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      )}
      {error && <Alert>{error}</Alert>}
      {loading && !data ? <Loading /> : data && (
        <>
          <table>
            <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {data.data.length === 0 && <tr><td colSpan={headers.length} className="muted">Sin resultados</td></tr>}
              {data.data.map((item) => <tr key={item.id}>{row(item).map((c, i) => <td key={i}>{c}</td>)}</tr>)}
            </tbody>
          </table>
          <Pager page={data} onChange={setPage} />
        </>
      )}
    </section>
  );
}