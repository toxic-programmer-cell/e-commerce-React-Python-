import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        if (res.data.user.role === 'SUPER_ADMIN') {
          navigate('/super-admin');
        } else if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="square-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: 'var(--color-accent)', marginBottom: '0.75rem' }}></span>
          <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SIGN IN TO VIBE</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', padding: '0.75rem 1rem', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};
