import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cartService } from '../../services/cartService';
import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          cartService.getCart(),
          addressService.getAddresses()
        ]);

        if (cartRes.success) setCart(cartRes.data);
        if (addrRes.success) {
          setAddresses(addrRes.data);
          const defaultAddr = addrRes.data.find(a => a.is_default) || addrRes.data[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address to proceed.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await orderService.checkout(selectedAddressId, notes);
      if (res.success) {
        navigate('/order-confirmation', { state: { order: res.data } });
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Stock availability might have changed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing checkout session..." />;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal >= 100.00 ? 0.00 : 10.00;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn btn-primary">GO TO SHOP</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>CHECKOUT & ORDER CONFIRMATION</h1>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)', padding: '1rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }}>
        {/* Left Form Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Step 1: Address Selection */}
          <div className="square-card">
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              1. Select Delivery Address
            </h3>

            {addresses.length === 0 ? (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  No saved delivery addresses found. Please add a shipping address in your profile first.
                </p>
                <Link to="/account/profile" className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
                  ADD ADDRESS IN PROFILE
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      border: selectedAddressId === addr.id ? '2px solid var(--color-border-strong)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      backgroundColor: selectedAddressId === addr.id ? '#fafafa' : '#fff'
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9375rem' }}>{addr.full_name} ({addr.address_type})</strong>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        {addr.address_line_1} {addr.address_line_2}<br />
                        {addr.city}, {addr.state} {addr.postal_code}<br />
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Gateway Selection */}
          <div className="square-card">
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              2. Payment Method
            </h3>
            <div style={{ border: '2px solid var(--color-border-strong)', padding: '1.25rem', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 size={24} color="var(--color-success)" />
              <div>
                <strong style={{ fontSize: '0.9375rem', textTransform: 'uppercase' }}>Cash on Delivery (COD)</strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  Pay cash directly to the delivery courier when your order arrives. Zero prepayment required.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Order Notes */}
          <div className="square-card">
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Delivery Notes (Optional)</h3>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Gate code, landmark, or special delivery instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Right Summary Column */}
        <div>
          <div className="square-card" style={{ position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Order Summary ({items.length} items)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '240px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{item.quantity} x {item.product?.name}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      SKU: {item.product?.sku}
                    </span>
                  </div>
                  <span style={{ fontWeight: 800 }}>${Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>${Number(subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border-strong)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                <span>TOTAL</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
              disabled={submitting || !selectedAddressId}
            >
              {submitting ? 'PROCESSING ORDER...' : 'PLACE ORDER (COD)'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
