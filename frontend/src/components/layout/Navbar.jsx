import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, User as UserIcon, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export const Navbar = ({ cartCount = 0, onOpenCart }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', sticky: 'top', zIndex: 100, position: 'sticky', top: 0 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '14px', height: '14px', backgroundColor: 'var(--color-accent)' }}></span>
          VIBE SQUARE
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</Link>
          <Link to="/shop" style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop</Link>
          <Link to="/about" style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</Link>
        </nav>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}
          />
          <button type="submit" style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <Search size={18} />
          </button>
        </form>

        {/* User Account & Cart Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={onOpenCart}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--color-text-primary)' }}
            aria-label="View Cart"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  <LayoutDashboard size={14} /> Admin
                </Link>
              )}
              {user.role === 'SUPER_ADMIN' && (
                <Link to="/super-admin" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  <ShieldAlert size={14} /> SuperAdmin
                </Link>
              )}
              <Link to="/account/orders" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, fontSize: '0.875rem' }}>
                <UserIcon size={18} /> Profile
              </Link>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
