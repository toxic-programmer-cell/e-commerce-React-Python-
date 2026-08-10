import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Home, Briefcase, MapPin } from 'lucide-react';
import { addressService } from '../../services/addressService';
import { useAuth } from '../../features/auth/AuthContext';
import { Modal } from '../../components/common/Modal';

export const Profile = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Address state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    address_type: 'HOME',
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAddresses();
      if (res.success) setAddresses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.createAddress(formData);
      if (res.success) {
        setIsModalOpen(false);
        fetchAddresses();
      }
    } catch (err) {
      alert(err.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await addressService.deleteAddress(id);
      fetchAddresses();
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>MY ACCOUNT PROFILE</h1>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Profile Card */}
        <div className="square-card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            PERSONAL INFORMATION
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', uppercase: 'true' }}>FULL NAME</span>
              <strong style={{ fontSize: '1rem' }}>{user?.first_name} {user?.last_name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', uppercase: 'true' }}>EMAIL ADDRESS</span>
              <strong>{user?.email}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', uppercase: 'true' }}>ROLE PERMISSION</span>
              <strong>{user?.role}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', uppercase: 'true' }}>PHONE</span>
              <strong>{user?.phone || 'Not provided'}</strong>
            </div>
          </div>
        </div>

        {/* Address Book Card */}
        <div className="square-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>ADDRESS BOOK ({addresses.length})</h3>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              <Plus size={14} /> ADD ADDRESS
            </button>
          </div>

          {addresses.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>No saved delivery addresses found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {addresses.map((addr) => (
                <div key={addr.id} style={{ border: '1px solid var(--color-border)', padding: '1rem', position: 'relative' }}>
                  {addr.is_default && (
                    <span className="badge badge-approved" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem' }}>
                      DEFAULT
                    </span>
                  )}
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{addr.full_name} ({addr.address_type})</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {addr.address_line_1} {addr.address_line_2}<br />
                    {addr.city}, {addr.state} {addr.postal_code}<br />
                    Phone: {addr.phone}
                  </p>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={14} /> Delete Address
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleCreateAddress}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-input" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address Line 1</label>
            <input type="text" className="form-input" required value={formData.address_line_1} onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address Line 2 (Optional)</label>
            <input type="text" className="form-input" value={formData.address_line_2} onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="form-input" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input type="text" className="form-input" required value={formData.postal_code} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Address Type</label>
              <select className="form-select" value={formData.address_type} onChange={(e) => setFormData({ ...formData, address_type: e.target.value })}>
                <option value="HOME">Home</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>SAVE ADDRESS</button>
        </form>
      </Modal>
    </div>
  );
};
