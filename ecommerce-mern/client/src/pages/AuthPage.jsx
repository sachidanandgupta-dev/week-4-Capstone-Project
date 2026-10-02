import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!isLogin && form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setServerError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name.trim(), form.email, form.password);
      navigate(state?.from || '/', { replace: true });
    } catch (err) { setServerError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <form className="card auth" onSubmit={onSubmit} noValidate>
      <h2>{isLogin ? 'Login' : 'Create account'}</h2>
      {serverError && <p className="error banner">{serverError}</p>}
      {!isLogin && (
        <label>Name<input name="name" value={form.name} onChange={onChange} />
          {errors.name && <span className="error">{errors.name}</span>}</label>
      )}
      <label>Email<input name="email" type="email" value={form.email} onChange={onChange} />
        {errors.email && <span className="error">{errors.email}</span>}</label>
      <label>Password<input name="password" type="password" value={form.password} onChange={onChange} />
        {errors.password && <span className="error">{errors.password}</span>}</label>
      <button className="btn" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Login' : 'Register'}</button>
      <p className="muted">
        {isLogin ? <>No account? <Link to="/register">Register</Link></> : <>Have an account? <Link to="/login">Login</Link></>}
      </p>
    </form>
  );
}
