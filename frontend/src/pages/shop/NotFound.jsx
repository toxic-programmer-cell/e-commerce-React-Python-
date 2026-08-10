import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
      <span style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', color: 'var(--color-text-muted)' }}>404</span>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>PAGE NOT FOUND</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        The requested URL does not exist or has been relocated.
      </p>
      <Link to="/" className="btn btn-primary">RETURN HOME</Link>
    </div>
  );
};
