import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/product/ProductCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Home = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getPublicProducts({ page_size: 4 }),
          productService.getCategories()
        ]);
        if (prodRes.success) setProducts(prodRes.data.results);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error("Error loading home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--color-accent-light)', borderBottom: '1px solid var(--color-border)', padding: '5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: 'var(--color-accent)', color: '#fff', padding: '4px 10px', marginBottom: '1.5rem', display: 'inline-block' }}>
              AUTUMN / WINTER COLLECTION 2026
            </span>
            <h1 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 800 }}>
              CRAFTED GEOMETRY.<br />VERIFIED QUALITY.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '480px', lineHeight: 1.6 }}>
              Minimalist luxury electronics, precision audio equipment, and timeless apparel. Inspected and approved by platform administrators.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/shop" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                EXPLORE CATALOG <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-outline" style={{ padding: '0.875rem 2rem' }}>
                INSPECTION PROCESS
              </Link>
            </div>
          </div>
          <div className="square-card" style={{ padding: '0', overflow: 'hidden', height: '400px', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
              alt="Square Aesthetic Product"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldCheck size={28} color="var(--color-accent)" />
            <div>
              <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>100% Inspected</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Every item reviewed and approved by SuperAdmin.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Truck size={28} color="var(--color-accent)" />
            <div>
              <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Cash on Delivery</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Pay safely when your package is delivered.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <RefreshCw size={28} color="var(--color-accent)" />
            <div>
              <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>30-Day Guarantee</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Hassle free returns on verified products.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Award size={28} color="var(--color-accent)" />
            <div>
              <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Verified Buyers</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Real reviews strictly from authenticated purchasers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="container" style={{ padding: '4rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>CURATED DEPARTMENTS</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>EXPLORE CATEGORIES</h2>
            </div>
            <Link to="/shop" style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              VIEW CATALOG <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="square-card" style={{ textDecoration: 'none', transition: 'transform 200ms ease' }}>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{cat.name}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{cat.description || 'Explore products'}</p>
                <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                  {cat.product_count || 0} PRODUCTS →
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Grid */}
      <section className="container" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>VERIFIED SELECTIONS</span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>FEATURED PRODUCTS</h2>
          </div>
          <Link to="/shop" style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            SEE ALL ({products.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading catalog items..." />
        ) : (
          <div className="grid-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
