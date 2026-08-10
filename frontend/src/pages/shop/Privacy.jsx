import React from 'react';

export const Privacy = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>PRIVACY POLICY</h1>
      <div className="square-card" style={{ padding: '2rem', lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: '1rem' }}>We respect your privacy. All user authentication and session data are stored securely using salted password hashes and JWT encryption.</p>
        <p>Your address details are strictly used for package shipment and order fulfillment.</p>
      </div>
    </div>
  );
};
