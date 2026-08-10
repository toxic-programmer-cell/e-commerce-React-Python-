import React, { useEffect, useState } from 'react';
import { Plus, Send, AlertTriangle, Edit, RefreshCw, Package } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    brand: '',
    price: '',
    discount_price: '',
    stock: '',
    short_description: '',
    description: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes, ordRes] = await Promise.all([
        adminService.getAdminProducts(),
        productService.getCategories(),
        productService.getBrands(),
        adminService.getAdminOrders()
      ]);

      if (prodRes.success) setProducts(prodRes.data.results);
      if (catRes.success) setCategories(catRes.data);
      if (brandRes.success) setBrands(brandRes.data);
      if (ordRes.success) setOrders(ordRes.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitForInspection = async (productId) => {
    try {
      const res = await adminService.submitForInspection(productId);
      if (res.success) {
        alert("Product submitted to SuperAdmin inspection queue!");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Failed to submit product.");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    for (let i = 0; i < imageFiles.length; i++) {
      data.append('images_data', imageFiles[i]);
    }

    try {
      const res = await adminService.createProduct(data);
      if (res.success) {
        setIsModalOpen(false);
        alert("Product created as DRAFT! You can now submit it for inspection.");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Product creation failed.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Status update failed.");
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>SELLER PORTAL</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>ADMIN MANAGEMENT DASHBOARD</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> NEW PRODUCT
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderBottom: activeTab === 'products' ? '3px solid var(--color-accent)' : 'none',
            color: activeTab === 'products' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          My Inventory & Submissions ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderBottom: activeTab === 'orders' ? '3px solid var(--color-accent)' : 'none',
            color: activeTab === 'orders' ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
          }}
        >
          Fulfillment Orders ({orders.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading seller portal records..." />
      ) : activeTab === 'products' ? (
        /* Products Management Table */
        <div className="table-container square-card" style={{ padding: 0 }}>
          <table className="square-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Inspection Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>
                    {p.name}
                    {p.rejection_reason && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={12} /> Reason: {p.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td><Badge status={p.status} /></td>
                  <td>
                    {(p.status === 'DRAFT' || p.status === 'REJECTED') && (
                      <button
                        onClick={() => handleSubmitForInspection(p.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        <Send size={12} /> SUBMIT INSPECTION
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Orders Fulfillment Table */
        <div className="table-container square-card" style={{ padding: 0 }}>
          <table className="square-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{ord.order_number}</td>
                  <td>{ord.customer_name} ({ord.shipping_city})</td>
                  <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 800 }}>${Number(ord.total_amount).toFixed(2)}</td>
                  <td><Badge status={ord.order_status} /></td>
                  <td>
                    <select
                      className="form-select"
                      value={ord.order_status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: '140px' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Product (DRAFT)">
        <form onSubmit={handleCreateProduct}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" className="form-input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input type="text" className="form-input" required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="PROD-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input type="number" className="form-input" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select className="form-select" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}>
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input type="number" step="0.01" className="form-input" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Price ($)</label>
              <input type="number" step="0.01" className="form-input" value={formData.discount_price} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <input type="text" className="form-input" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Full Description</label>
            <textarea className="form-textarea" rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Product Images</label>
            <input type="file" className="form-input" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>SAVE AS DRAFT</button>
        </form>
      </Modal>
    </div>
  );
};
