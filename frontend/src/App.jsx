import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';

// Services
import { cartService } from './services/cartService';

// Pages
import { Home } from './pages/shop/Home';
import { ProductListing } from './pages/shop/ProductListing';
import { ProductDetails } from './pages/shop/ProductDetails';
import { About } from './pages/shop/About';
import { Terms } from './pages/shop/Terms';
import { Privacy } from './pages/shop/Privacy';
import { NotFound } from './pages/shop/NotFound';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Profile } from './pages/account/Profile';
import { Orders } from './pages/account/Orders';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { OrderConfirmationPage } from './pages/checkout/OrderConfirmationPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export function App() {
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await cartService.getCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleAddToCart = async (productId, quantity = 1, variantId = null) => {
    try {
      const res = await cartService.addToCart(productId, quantity, variantId);
      if (res.success) {
        setCart(res.data);
        setIsCartOpen(true);
      }
    } catch (err) {
      alert(err.message || "Failed to add product to cart.");
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartService.updateCartItem(itemId, quantity);
      if (res.success) setCart(res.data);
    } catch (err) {
      alert(err.message || "Failed to update item.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await cartService.removeCartItem(itemId);
      if (res.success) setCart(res.data);
    } catch (err) {
      alert(err.message || "Failed to remove item.");
    }
  };

  const totalCartCount = cart?.total_items || 0;

  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} />

          <main style={{ flexGrow: 1 }}>
            <Routes>
              {/* Public Shop Routes */}
              <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
              <Route path="/shop" element={<ProductListing onAddToCart={handleAddToCart} />} />
              <Route path="/product/:slugOrId" element={<ProductDetails onAddToCart={handleAddToCart} />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Account Protected Routes */}
              <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/account/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

              {/* Checkout Protected Routes */}
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

              {/* Admin Seller Portal */}
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />

              {/* SuperAdmin Controller Portal */}
              <Route path="/super-admin/*" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Cart Slide Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
