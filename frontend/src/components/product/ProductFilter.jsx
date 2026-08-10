import React from 'react';

export const ProductFilter = ({ categories = [], brands = [], selectedCategory, selectedBrand, minPrice, maxPrice, onFilterChange, onReset }) => {
  return (
    <div className="square-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        Filter Products
      </h3>

      {/* Category Filter */}
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          className="form-select"
          value={selectedCategory}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Brand Filter */}
      <div className="form-group">
        <label className="form-label">Brand</label>
        <select
          className="form-select"
          value={selectedBrand}
          onChange={(e) => onFilterChange('brand', e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="form-group">
        <label className="form-label">Price Range ($)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            className="form-input"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onFilterChange('min_price', e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onFilterChange('max_price', e.target.value)}
          />
        </div>
      </div>

      <button onClick={onReset} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.75rem' }}>
        CLEAR ALL FILTERS
      </button>
    </div>
  );
};
