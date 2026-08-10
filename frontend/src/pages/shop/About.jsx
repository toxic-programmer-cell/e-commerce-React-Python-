import React from 'react';
import { ShieldCheck, Award, Zap } from 'lucide-react';

export const About = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>PLATFORM PHILOSOPHY</span>
      <h1 style={{ fontSize: '2.5rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>ABOUT VIBE SQUARE ARCHITECTURE</h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
        Vibe Square is a full-stack e-commerce environment engineered around strict product quality verification, atomic stock accuracy, and classic geometric UI design.
      </p>

      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        <div className="square-card">
          <ShieldCheck size={32} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>SUPERADMIN INSPECTION</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Products uploaded by seller admins remain in DRAFT status until audited and approved by SuperAdmins.
          </p>
        </div>
        <div className="square-card">
          <Zap size={32} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>SERVER-SIDE EFFICIENCY</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Search, filtering, sorting, and pagination are processed server-side with database index optimizations.
          </p>
        </div>
        <div className="square-card">
          <Award size={32} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ATOMIC STOCK LOCKING</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Database transactions use row locking (`select_for_update`) during checkout to eliminate race conditions.
          </p>
        </div>
      </div>
    </div>
  );
};
