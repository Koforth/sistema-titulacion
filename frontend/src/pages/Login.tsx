import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui';
import { errorMessage } from '../hooks/useApi';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="card login-card" onSubmit={submit} aria-labelledby="login-title">
        <div className="login-header">
          <strong className="login-brand">SIGTU</strong>
          <h1 id="login-title">Iniciar sesión</h1>
          <p className="muted">Sistema Integral de Gestión de Títulos Universitarios</p>
        </div>

        {error && <Alert>{error}</Alert>}

        <label htmlFor="login-email">
          Correo electrónico
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="usuario@sigtu.edu.ni"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label htmlFor="login-password">
          Contraseña
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {loading ? 'Accediendo...' : 'Entrar'}
        </button>

        <div className="login-footer">
          <Link to="/">← Ir a la Consulta pública de títulos</Link>
        </div>
      </form>
    </div>
  );
}
