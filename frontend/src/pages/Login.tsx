import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui';
import { errorMessage } from '../hooks/useApi';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try { await login(email, password); nav('/dashboard'); } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>Iniciar sesión</h1>
      {error && <Alert>{error}</Alert>}
      <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      <button type="submit">Entrar</button>
      <p><a href="/">Consulta pública de títulos</a></p>
    </form>
  );
}