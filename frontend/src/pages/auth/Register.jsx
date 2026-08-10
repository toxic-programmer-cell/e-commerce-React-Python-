import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="square-card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: 'var(--color-accent)', marginBottom: '0.75rem' }}></span>
          <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CREATE ACCOUNT</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Register as a customer to browse and purchase verified items
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', padding: '0.75rem 1rem', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="first_name" className="form-input" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="last_name" className="form-input" value={formData.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" name="username" className="form-input" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="+1 555-0192" />
          </div>

          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="password_confirm" className="form-input" value={formData.password_confirm} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem', paddingTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
