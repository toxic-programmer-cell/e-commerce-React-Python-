import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getUserOrders();
        if (res.success) setOrders(res.data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStepActive = (currentStatus, stepStatus) => {
    const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const curIdx = steps.indexOf(currentStatus);
    const stepIdx = steps.indexOf(stepStatus);
    return curIdx >= stepIdx;
  };

  if (loading) return <LoadingSpinner message="Retrieving order history..." />;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>MY ORDERS ({orders.length})</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2.5rem' }}>
        Track order fulfillment lifecycle and view historical item snapshots.
      </p>

      {orders.length === 0 ? (
        <EmptyState
          title="No Orders Placed Yet"
          message="You haven't placed any orders yet. Visit our shop catalog to place an order."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((ord) => (
            <div key={ord.id} className="square-card" style={{ padding: '1.75rem' }}>
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem' }}>ORDER #{ord.order_number}</h3>
                    <Badge status={ord.order_status} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Placed on {new Date(ord.created_at).toLocaleDateString()} • Payment: {ord.payment_method} ({ord.payment_status})
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    ${Number(ord.total_amount).toFixed(2)}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Est. Delivery: {ord.estimated_delivery_date || 'Within 5 Business Days'}
                  </span>
                </div>
              </div>

              {/* Delivery Tracker Bar */}
              <div style={{ backgroundColor: 'var(--color-accent-light)', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>LIVE FULFILLMENT TRACKER</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, idx) => {
                    const active = getStepActive(ord.order_status, step);
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          backgroundColor: active ? 'var(--color-accent)' : '#fff',
                          color: active ? '#fff' : 'var(--color-text-muted)',
                          border: active ? 'none' : '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          marginBottom: '0.375rem'
                        }}>
                          {active ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items Table */}
              <div className="table-container">
                <table className="square-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU Snapshot</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ord.items?.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.product_name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{item.product_sku}</td>
                        <td>${Number(item.unit_price).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td style={{ fontWeight: 800 }}>${Number(item.total_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Ship to: <strong>{ord.shipping_name}</strong> - {ord.shipping_address_line_1}, {ord.shipping_city} ({ord.shipping_phone})</span>
                <span>UUID: {ord.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
