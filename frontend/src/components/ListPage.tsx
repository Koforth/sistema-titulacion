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

/** 
 * Listado paginado con búsqueda accesible y eficiente (ISO 9241-11 e ISO 25010)
 */
export default function ListPage<T extends { id: number }>({
  title,
  path,
  searchable = true,
  headers,
  row,
  actions,
}: Props<T>) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const sep = path.includes('?') ? '&' : '?';
  const { data, error, loading } = useApi<Page<T>>(
    `${path}${sep}page=${page}&q=${encodeURIComponent(q)}`
  );

  return (
    <section aria-labelledby="section-title">
      <div className="toolbar">
        <h1 id="section-title">{title}</h1>
        {actions}
      </div>
      {searchable && (
        <div className="search-box">
          <label htmlFor="search-input" className="sr-only" style={{ display: 'none' }}>
            Buscar en {title}
          </label>
          <input
            id="search-input"
            className="search"
            placeholder={`Buscar en ${title.toLowerCase()}...`}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            aria-label={`Buscar en ${title}`}
          />
        </div>
      )}
      {error && <Alert>{error}</Alert>}
      {loading && !data ? (
        <Loading />
      ) : (
        data && (
          <>
            <div className="table-container" role="region" aria-label={`Tabla de ${title}`} tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    {headers.map((h, idx) => (
                      <th key={idx} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length} className="muted" style={{ textAlign: 'center', padding: '2rem' }}>
                        No se encontraron registros coincidentes.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((item) => (
                      <tr key={item.id}>
                        {row(item).map((c, i) => (
                          <td key={i}>{c}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager page={data} onChange={setPage} />
          </>
        )
      )}
    </section>
  );
}
