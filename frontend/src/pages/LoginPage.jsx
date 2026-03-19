import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector(state => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (token) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [token, navigate, dispatch]);

  async function handleSubmit(e) {
    e.preventDefault();
    await dispatch(login(form));
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-badge">⬡</div>
        <div className="login-title">POLOPS</div>
        <div className="login-sub">POLICE OPERATIONS SYSTEM</div>
        <div className="login-district">PUNE DISTRICT HEADQUARTERS</div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-banner">{error}</div>}
          <div className="form-group">
            <label>SERVICE EMAIL</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="officer@pune.police.gov.in" />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" value={form.password} required
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </button>
        </form>
        <div className="login-footer">AUTHORIZED PERSONNEL ONLY</div>
      </div>
    </div>
  );
}
