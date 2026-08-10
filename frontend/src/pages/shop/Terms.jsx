import React from 'react';

export const Terms = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>TERMS OF SERVICE</h1>
      <div className="square-card" style={{ padding: '2rem', lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>Welcome to Vibe Square E-Commerce Platform. By accessing or using our platform, you agree to be bound by these terms.</p>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', margin: '1.5rem 0 0.5rem 0' }}>1. Verified Products</h3>
        <p>All items displayed publicly on Vibe Square undergo a formal SuperAdmin inspection process prior to listing.</p>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', margin: '1.5rem 0 0.5rem 0' }}>2. Cash on Delivery (COD)</h3>
        <p>For orders placed using Cash on Delivery, payment must be collected in full by the courier upon package arrival.</p>
      </div>
    </div>
  );
};
