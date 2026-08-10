import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', marginTop: '5rem', padding: '4rem 0 2rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'var(--color-accent)' }}></span>
              VIBE SQUARE
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', maxWidth: '320px', lineHeight: 1.6 }}>
              A high-precision e-commerce platform built with classic geometric design, verified product inspection, and transparent order tracking.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Catalog</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=electronics">Electronics</Link></li>
              <li><Link to="/shop?category=apparel-luxury">Apparel & Luxury</Link></li>
              <li><Link to="/shop?category=home-living">Home & Living</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Customer</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <li><Link to="/account/orders">My Orders</Link></li>
              <li><Link to="/account/addresses">Address Book</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Newsletter</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              Subscribe for new collection drops and inspection updates.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" className="form-input" placeholder="Your email address" style={{ height: '2.5rem', fontSize: '0.8125rem' }} />
              <button className="btn btn-primary" style={{ padding: '0 1rem', height: '2.5rem', fontSize: '0.75rem' }}>JOIN</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          <p>© 2026 Vibe Square Platform. All rights reserved.</p>
          <p>Production Built with Django REST Framework & React.js</p>
        </div>
      </div>
    </footer>
  );
};
