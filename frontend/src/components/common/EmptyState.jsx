import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ title = "No Items Found", message = "There are currently no items matching your criteria.", actionText, onAction }) => {
  return (
    <div className="square-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3.5rem 2rem', gap: '1rem', margin: '2rem 0' }}>
      <div style={{ backgroundColor: 'var(--color-accent-light)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <PackageOpen size={36} color="var(--color-text-secondary)" />
      </div>
      <h4 style={{ fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '420px' }}>{message}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};
