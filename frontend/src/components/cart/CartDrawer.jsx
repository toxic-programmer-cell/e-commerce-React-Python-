import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }) => {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border-strong)',
          width: '100%',
          maxWidth: '450px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-elevated)',
          padding: '1.75rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} />
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shopping Cart ({items.length})</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Your cart is empty.</p>
              <button onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>CONTINUE SHOPPING</button>
            </div>
          ) : (
            items.map((item) => {
              const img = item.product?.primary_image?.image || 'https://via.placeholder.com/100';
              return (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
                  <img src={img} alt={item.product?.name} style={{ width: '64px', height: '64px', objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2 }}>{item.product?.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      ${Number(item.unit_price).toFixed(2)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', height: '22px' }}
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >-</button>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', height: '22px' }}
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                      ${Number(item.total_price).toFixed(2)}
                    </p>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', marginTop: '0.5rem' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem', fontWeight: 800 }}>
              <span>SUBTOTAL</span>
              <span>${Number(subtotal).toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Taxes calculated at checkout. Free Cash on Delivery available.
            </p>
            <Link to="/checkout" onClick={onClose} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              PROCEED TO CHECKOUT <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
