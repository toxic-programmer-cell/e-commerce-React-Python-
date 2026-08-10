import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, UserPlus, FileText, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inspection');
  const [stats, setStats] = useState(null);
  const [inspectionQueue, setInspectionQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Rejecting Product
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Modal State for Creating Admin
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes, usersRes, logsRes] = await Promise.all([
        superAdminService.getStats(),
        superAdminService.getInspectionQueue(),
        superAdminService.getUsers(),
        superAdminService.getAuditLogs()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (queueRes.success) setInspectionQueue(queueRes.data.results);
      if (usersRes.success) setUsers(usersRes.data.results);
      if (logsRes.success) setAuditLogs(logsRes.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (productId) => {
    if (window.confirm("Approve this product for public visibility?")) {
      try {
        const res = await superAdminService.approveProduct(productId);
        if (res.success) {
          alert("Product APPROVED and published!");
          fetchData();
        }
      } catch (err) {
        alert(err.message || "Approval failed.");
      }
    }
  };

  const handleOpenReject = (productId) => {
    setSelectedProductId(productId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await superAdminService.rejectProduct(selectedProductId, rejectionReason);
      if (res.success) {
        setRejectModalOpen(false);
        alert("Product REJECTED and returned to seller with feedback.");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Rejection failed.");
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await superAdminService.toggleUserStatus(userId);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Action failed.");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await superAdminService.createAdmin(adminForm);
      if (res.success) {
        setAdminModalOpen(false);
        alert("New Admin created successfully!");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Admin creation failed.");
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-accent)' }}>SUPERADMIN CONTROLLER</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>PLATFORM GOVERNANCE & INSPECTIONS</h1>
        </div>
        <button onClick={() => setAdminModalOpen(true)} className="btn btn-primary">
          <UserPlus size={16} /> CREATE ADMIN
        </button>
      </div>

      {/* Platform Statistics Metric Grid */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div className="square-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', uppercase: 'true' }}>PENDING INSPECTIONS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
              {stats.pending_inspections}
            </div>
          </div>
          <div className="square-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', uppercase: 'true' }}>APPROVED PRODUCTS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>
              {stats.approved_products}
            </div>
          </div>
          <div className="square-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', uppercase: 'true' }}>REGISTERED USERS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {stats.total_users} Users / {stats.total_admins} Admins
            </div>
          </div>
          <div className="square-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', uppercase: 'true' }}>TOTAL REVENUE</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
              ${Number(stats.total_revenue).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('inspection')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
            borderBottom: activeTab === 'inspection' ? '3px solid var(--color-accent)' : 'none'
          }}
        >
          Inspection Queue ({inspectionQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
            borderBottom: activeTab === 'users' ? '3px solid var(--color-accent)' : 'none'
          }}
        >
          Users & Admins Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
            borderBottom: activeTab === 'audit' ? '3px solid var(--color-accent)' : 'none'
          }}
        >
          System Audit Trail
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading superadmin control records..." />
      ) : activeTab === 'inspection' ? (
        /* Inspection Queue Table */
        <div className="table-container square-card" style={{ padding: 0 }}>
          <table className="square-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspectionQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No products currently waiting in inspection queue.
                  </td>
                </tr>
              ) : (
                inspectionQueue.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.name}</td>
                    <td>{p.seller_name}</td>
                    <td>{p.category?.name}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="btn btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                        >
                          <Check size={12} /> APPROVE
                        </button>
                        <button
                          onClick={() => handleOpenReject(p.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
                        >
                          <X size={12} /> REJECT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'users' ? (
        /* Users Directory Table */
        <div className="table-container square-card" style={{ padding: 0 }}>
          <table className="square-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td><strong>{u.role}</strong></td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                      {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className={`btn ${u.is_active ? 'btn-danger' : 'btn-outline'}`}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      {u.is_active ? 'DEACTIVATE' : 'REACTIVATE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="table-container square-card" style={{ padding: 0 }}>
          <table className="square-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 700 }}>{log.actor_email}</td>
                  <td><code style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{log.action}</code></td>
                  <td>{log.target_type} ({log.target_id?.slice(0, 8)}...)</td>
                  <td style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{JSON.stringify(log.details)}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Product Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Product Submission">
        <form onSubmit={handleRejectSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for Rejection (Required)</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Provide clear reasons for rejection so seller can edit and resubmit..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '1rem' }}>
            CONFIRM REJECTION
          </button>
        </form>
      </Modal>

      {/* Create Admin Modal */}
      <Modal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} title="Create New Seller Admin">
        <form onSubmit={handleCreateAdmin}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" required value={adminForm.first_name} onChange={(e) => setAdminForm({ ...adminForm, first_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" required value={adminForm.last_name} onChange={(e) => setAdminForm({ ...adminForm, last_name: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" required value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Business Email</label>
            <input type="email" className="form-input" required value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" required value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>CREATE ADMIN</button>
        </form>
      </Modal>
    </div>
  );
};
