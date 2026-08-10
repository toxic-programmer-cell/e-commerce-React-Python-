import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductFilter } from '../../components/product/ProductFilter';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const ProductListing = ({ onAddToCart }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, total_pages: 1, current_page: 1 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const ordering = searchParams.get('ordering') || '-created_at';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error("Failed loading metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getPublicProducts({
          search,
          category,
          brand,
          min_price: minPrice,
          max_price: maxPrice,
          ordering,
          page,
          page_size: 12
        });

        if (res.success) {
          setProducts(res.data.results);
          setPagination({
            count: res.data.count,
            total_pages: res.data.total_pages,
            current_page: res.data.current_page
          });
        }
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, brand, minPrice, maxPrice, ordering, page]);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>STORE CATALOG</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>
            {search ? `SEARCH: "${search}"` : category ? `CATEGORY: ${category.toUpperCase()}` : 'ALL PRODUCTS'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Showing {products.length} of {pagination.count} verified approved items
          </p>
        </div>

        {/* Ordering Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SORT BY:</label>
          <select
            className="form-select"
            value={ordering}
            onChange={(e) => updateFilters('ordering', e.target.value)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem', width: '180px' }}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem' }}>
        {/* Sidebar Filters */}
        <div>
          <ProductFilter
            categories={categories}
            brands={brands}
            selectedCategory={category}
            selectedBrand={brand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div>
          {loading ? (
            <LoadingSpinner message="Fetching verified product data..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Found"
              message="No approved products match your active search or filter criteria. Try clearing filters."
              actionText="RESET ALL FILTERS"
              onAction={resetFilters}
            />
          ) : (
            <>
              <div className="grid-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
                ))}
              </div>

              {/* Server-Side Pagination Controls */}
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
