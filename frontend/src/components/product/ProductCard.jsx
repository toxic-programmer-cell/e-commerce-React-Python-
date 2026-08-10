import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';

export const ProductCard = ({ product, onAddToCart }) => {
  const imageUrl = product.primary_image?.image || 'https://via.placeholder.com/400x400?text=No+Image';

  return (
    <div className="square-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
      {/* Product Image */}
      <Link to={`/product/${product.slug || product.id}`} style={{ display: 'block', position: 'relative', width: '100%', paddingTop: '100%', backgroundColor: '#f4f4f5' }}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />
        {product.discount_price && (
          <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', textTransform: 'uppercase' }}>
            SALE
          </span>
        )}
      </Link>

      {/* Product Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category?.name || 'General'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <Star size={12} fill="#eab308" color="#eab308" />
              <span>{product.average_rating || '5.0'}</span>
            </div>
          </div>

          <Link to={`/product/${product.slug || product.id}`}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              {product.name}
            </h3>
          </Link>

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
            {product.short_description || product.description}
          </p>
        </div>

        {/* Pricing and Cart Action */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {product.discount_price ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  ${Number(product.discount_price).toFixed(2)}
                </span>
                <span style={{ fontSize: '0.8125rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                ${Number(product.price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(product.id)}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            disabled={product.stock <= 0}
          >
            <ShoppingBag size={14} /> {product.stock > 0 ? 'ADD' : 'OUT'}
          </button>
        </div>
      </div>
    </div>
  );
};
