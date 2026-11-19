import type { ReactNode } from 'react';
import type { Page } from '../api/client';

export const Alert = ({ kind = 'error', children }: { kind?: 'error' | 'success'; children: ReactNode }) =>
  <div className={`alert ${kind}`} role="alert">{children}</div>;

export const Loading = () => <p className="muted">Cargando…</p>;

export function Pager<T>({ page, onChange }: { page: Page<T>; onChange: (n: number) => void }) {
  if (page.last_page <= 1) return null;
  return (
    <div className="pager">
      <button disabled={page.current_page <= 1} onClick={() => onChange(page.current_page - 1)}>Anterior</button>
      <span>Página {page.current_page} de {page.last_page}</span>
      <button disabled={page.current_page >= page.last_page} onClick={() => onChange(page.current_page + 1)}>Siguiente</button>
    </div>
  );
}

const colores: Record<string, string> = { LEON: 'blue', IMPRENTA: 'orange', SETEC: 'purple', ENTREGADO: 'green' };
export const Badge = ({ value }: { value?: string }) =>
  <span className={`badge ${colores[value ?? ''] ?? 'gray'}`}>{value ?? '—'}</span>;

export const fecha = (s?: string) => (s ? new Date(s).toLocaleDateString('es') : '—');