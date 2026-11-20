import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import App from '../App';

afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

describe('Rutas protegidas', () => {
  it('redirige a login cuando no hay sesión', async () => {
    render(<MemoryRouter initialEntries={['/graduados']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Iniciar sesión/)).toBeInTheDocument());
  });

  it('la consulta pública no requiere sesión', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ titulos_emitidos: 1, total_registrados: 2 }), { status: 200 }));
    render(<MemoryRouter initialEntries={['/']}><AuthProvider><App /></AuthProvider></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Consulta pública de títulos')).toBeInTheDocument());
  });
});