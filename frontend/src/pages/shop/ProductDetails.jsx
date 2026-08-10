import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, ShoppingBag, Truck, Check, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../features/auth/AuthContext';

export const ProductDetails = ({ onAddToCart }) => {
  const { slugOrId } = useParams();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewErr, setReviewErr] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductDetail(slugOrId);
        if (res.success) {
          setProduct(res.data);
          const primImg = res.data.images?.find(i => i.is_primary)?.image || res.data.images?.[0]?.image;
          setSelectedImage(primImg);
          if (res.data.variants?.length > 0) {
            setSelectedVariant(res.data.variants[0]);
          }

          // Fetch Product Reviews
          const revRes = await reviewService.getProductReviews(res.data.id);
          if (revRes.success) {
            setReviews(revRes.data.results);
          }
        }
      } catch (err) {
        console.error("Error fetching product details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slugOrId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    setReviewErr('');

    try {
      const res = await reviewService.submitReview({
        product_id: product.id,
        order_id: orderId,
        rating,
        title,
        comment
      });
      if (res.success) {
        setReviewMsg("Review submitted successfully!");
        setReviews([res.data, ...reviews]);
        setTitle('');
        setComment('');
        setOrderId('');
      }
    } catch (err) {
      setReviewErr(err.message || "Failed to submit review. Ensure you purchased this product.");
    }
  };

  if (loading) return <LoadingSpinner message="Loading product specs..." />;
  if (!product) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}><h2>Product Not Found</h2></div>;

  const currentPrice = selectedVariant?.variant_price || product.current_price;
  const stock = selectedVariant?.stock ?? product.stock;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name}</Link> / <span>{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', marginBottom: '4rem' }}>
        {/* Left Image Gallery */}
        <div>
          <div className="square-card" style={{ padding: 0, overflow: 'hidden', height: '480px', marginBottom: '1rem', backgroundColor: '#f4f4f5' }}>
            <img
              src={selectedImage || 'https://via.placeholder.com/600'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
              {product.images.map((imgObj) => (
                <button
                  key={imgObj.id}
                  onClick={() => setSelectedImage(imgObj.image)}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: selectedImage === imgObj.image ? '2px solid var(--color-border-strong)' : '1px solid var(--color-border)',
                    padding: 0,
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img src={imgObj.image} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Options & Purchase */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            {product.brand?.name || product.category?.name} • SKU: {product.sku}
          </span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.375rem', marginBottom: '0.75rem' }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} fill={s <= Math.round(product.average_rating || 5) ? "#eab308" : "none"} color="#eab308" />
              ))}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{product.average_rating} ({product.review_count} verified reviews)</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                ${Number(currentPrice).toFixed(2)}
              </span>
              {product.discount_price && (
                <span style={{ fontSize: '1.125rem', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Available Options</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                {product.variants.map((varObj) => (
                  <button
                    key={varObj.id}
                    className={`btn ${selectedVariant?.id === varObj.id ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                    onClick={() => setSelectedVariant(varObj)}
                  >
                    {varObj.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator & Add to Cart */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {stock > 0 ? (
                <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={16} /> IN STOCK ({stock} units available)
                </span>
              ) : (
                <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={16} /> OUT OF STOCK
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                <button
                  className="btn btn-outline"
                  style={{ border: 'none', padding: '0.75rem 1rem' }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={stock <= 0}
                >-</button>
                <span style={{ padding: '0 1rem', fontWeight: 800 }}>{quantity}</span>
                <button
                  className="btn btn-outline"
                  style={{ border: 'none', padding: '0.75rem 1rem' }}
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={stock <= 0 || quantity >= stock}
                >+</button>
              </div>

              <button
                onClick={() => onAddToCart(product.id, quantity, selectedVariant?.id)}
                className="btn btn-primary"
                style={{ flexGrow: 1, padding: '0.875rem 2rem' }}
                disabled={stock <= 0}
              >
                <ShoppingBag size={18} /> ADD TO CART
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="square-card" style={{ backgroundColor: 'var(--color-accent-light)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 }}>
              <ShieldCheck size={18} color="var(--color-accent)" /> SuperAdmin Inspected & Approved Product
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              <Truck size={18} color="var(--color-accent)" /> Free Cash on Delivery available at checkout
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '3rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>VERIFIED PURCHASER REVIEWS</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Reviews List */}
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No reviews posted yet for this product.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((r) => (
                  <div key={r.id} className="square-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.reviewer_name}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= r.rating ? "#eab308" : "none"} color="#eab308" />
                        ))}
                      </div>
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{r.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{r.comment}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                      Verified Purchase • {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="square-card">
            <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Write a Review</h4>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit}>
                {reviewMsg && <div style={{ color: 'var(--color-success)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{reviewMsg}</div>}
                {reviewErr && <div style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{reviewErr}</div>}

                <div className="form-group">
                  <label className="form-label">Order ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your Order UUID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating Score</label>
                  <select className="form-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Below Average</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Summary title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>SUBMIT REVIEW</button>
              </form>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Please <Link to="/login" style={{ fontWeight: 700, underline: 'always' }}>login</Link> to submit a review for your purchased products.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
