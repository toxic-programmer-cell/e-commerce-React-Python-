import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container" style={{ padding: '5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="square-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ backgroundColor: 'var(--color-success-bg)', width: '64px', height: '64px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <CheckCircle size={36} color="var(--color-success)" />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ORDER CONFIRMED</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
          Thank you for your purchase! Your order has been registered in our system and stock has been allocated.
        </p>

        {order && (
          <div style={{ backgroundColor: '#fafafa', border: '1px solid var(--color-border)', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <span>Order Number:</span>
              <strong style={{ fontFamily: 'monospace' }}>{order.order_number}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <span>Payment Status:</span>
              <strong>{order.payment_method} ({order.payment_status})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              <span>Estimated Delivery:</span>
              <strong>{order.estimated_delivery_date || 'Within 5 Days'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', fontSize: '1rem', fontWeight: 800 }}>
              <span>Total Amount:</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/account/orders" className="btn btn-primary">
            VIEW ORDER HISTORY <ArrowRight size={16} />
          </Link>
          <Link to="/shop" className="btn btn-outline">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
};
