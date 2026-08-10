# Project Implementation Plan

This implementation plan outlines the 15 phases for constructing the full-stack production e-commerce platform.

---

## Phases Overview

### Phase 1: Environment & Project Foundation
- Establish `frontend/` (React + Vite) and `backend/` (Django + DRF) folder structures.
- Set up Virtual Environment (`backend/myenv`) and install backend dependencies (`Django`, `djangorestframework`, `django-cors-headers`, `psycopg2-binary`, `pillow`, `PyJWT`).
- Configure PostgreSQL database (`vibe_ecommerce_db`) and settings package (`config.settings`).

### Phase 2: Backend Models & Database Schema
- Implement `apps.users`: Custom `User` model with roles (`USER`, `ADMIN`, `SUPER_ADMIN`).
- Implement `apps.products`: `Category`, `Brand`, `Product`, `ProductImage`, `ProductVariant`.
- Implement `apps.cart`: `Cart`, `CartItem`.
- Implement `apps.addresses`: `Address`.
- Implement `apps.orders`: `Order`, `OrderItem`.
- Implement `apps.reviews`: `Review`.
- Implement `apps.inspections`: `ProductInspection`.
- Implement `apps.audit_logs`: `AuditLog`.
- Generate and run Django migrations against PostgreSQL.

### Phase 3: Authentication & Permissions Engine
- Build JWT authentication (Register, Login, Token Refresh, Profile, Logout).
- Implement custom permissions: `IsUser`, `IsAdmin`, `IsSuperAdmin`, `IsSellerOwnerOrSuperAdmin`.
- Create User Management APIs for SuperAdmin (list, view, deactivate, reactivate).
- Create Admin Management APIs for SuperAdmin (create admin, list, activate, deactivate).

### Phase 4: Product Management & Inspection Workflow
- Implement product CRUD for Admins (`DRAFT` state default).
- Implement Product Inspection endpoints: Submit for inspection, SuperAdmin inspection queue, Approve product, Reject product with reason.
- Public Product APIs: strictly returns `APPROVED` & `is_active=True` products.

### Phase 5: Server-side Search, Filter, Sort, Pagination
- Implement DRF filtering backends (`django-filter` / custom FilterSet).
- Server-side Search across product name, description, SKU, brand, category.
- Server-side Filtering by price range (`min_price`, `max_price`), category slug, brand slug.
- Server-side Sorting (`ordering` parameter: `-created_at`, `price`, `-price`, `rating`).
- Server-side Pagination with metadata (`count`, `next`, `previous`, `results`, `page_size`).

### Phase 6: Cart, Address, Order & Inventory Engine
- Cart CRUD: add, update quantity, remove, clear, backend total calculations.
- Address CRUD: add, edit, list, set default.
- Atomic Checkout endpoint: transaction lock (`select_for_update`), stock check & decrement, price freezing in `OrderItem`, order status initialization (`PENDING`, `COD_PENDING`).
- Order tracking endpoints & seller order fulfillment updates.

### Phase 7: Product Review Engine
- Create review endpoint with purchase verification check (`OrderItem` exists for user and order `DELIVERED`).
- Dynamic rating score updating on `Product`.

### Phase 8: Frontend Architecture & Square Design System
- Setup React Router v6 with public & protected route trees.
- Build Square Classic design system in CSS tokens (`src/index.css`): geometric cards, editorial typography, sharp borders, clean grids, status badges, alerts, buttons, inputs, tables, loading skeletons, modal overlays.
- Create HTTP client API service layer with JWT auto-refresh and error handling.

### Phase 9: Public Shop Frontend Pages
- Home page with banner grid, featured categories, and trending products.
- Product Listing & Search Results page with URL parameter-driven filters, search box, sorting dropdown, and pagination.
- Product Detail page with image gallery, variant selector, specs table, stock indicator, add-to-cart, and buyer reviews.
- Static Pages: About, Contact, Terms, Privacy, 404.

### Phase 10: Customer Account & Checkout Frontend
- Customer Profile & Address Management views.
- Cart Drawer / Cart Page.
- Multi-step Checkout page: Address select/create, Order review, COD confirmation.
- Customer Orders list & Order Detail view with live delivery status tracker.

### Phase 11: Admin & SuperAdmin Dashboards
- Admin Dashboard: Products list (with status tags: DRAFT, SUBMITTED, APPROVED, REJECTED), Create/Edit Product form with image uploader, Seller Orders management.
- SuperAdmin Dashboard: Inspection Queue (Approve/Reject modal with reason), Admin User creation/deactivation, User directory, Audit Log table, Platform statistics.

### Phase 12: Audit Logging & Security Hardening
- Log administrative actions to `AuditLog`.
- CORS/CSRF configuration check, production settings validation.

### Phase 13: Seed Data & Testing
- Create comprehensive seed command (`python manage.py seed_data`).
- Run backend unit/integration tests (`python manage.py test`).

### Phase 14: Documentation & Production Setup
- Complete `docs/API.md`, `docs/DATABASE.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`, and root `README.md`.
