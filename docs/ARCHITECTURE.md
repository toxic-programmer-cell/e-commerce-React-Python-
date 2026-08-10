# E-Commerce Platform Architecture Specification

## Executive Overview

This document outlines the end-to-end production architecture for the Full-Stack E-Commerce Platform. Built with a decoupled architecture (React.js frontend, Django REST Framework backend, PostgreSQL relational database), the platform implements a high-trust product inspection workflow, multi-role security boundaries, server-side pagination/filtering/search, and transactional inventory management.

---

## System Architecture

```
[ Client Browsers ]
       │
       │ HTTP / HTTPS (REST API & Static Assets)
       ▼
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  React.js (Vite) + React Router v6                      │
│  - Square Design System (Vanilla CSS / Custom Tokens)   │
│  - Feature-Based State & API Client                     │
│  - Optimistic UI Updates & URL-Driven Filter State       │
└───────────────────────────┬─────────────────────────────┘
                            │ JSON API (CORS + JWT Auth)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│  Django 5 + Django REST Framework                       │
│  - Auth & Role Permissions Middleware                   │
│  - Domain Apps (Users, Products, Cart, Orders, etc.)    │
│  - Audit Logging & Product Inspection Engine            │
└───────────────────────────┬─────────────────────────────┘
                            │ ORM SQL Queries (select_related)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                            │
│  PostgreSQL 17                                          │
│  - Normalized Schema + Indexing                         │
│  - Atomic Inventory Transactions                        │
│  - Soft-deletes & Snapshot Preservation                 │
└─────────────────────────────────────────────────────────┘
```

---

## Architecture Breakdown

### 1. Frontend Architecture (React.js)
- **Core Technology**: React 18 / 19 with Vite bundler.
- **Routing**: React Router v6 with declarative route trees, `ProtectedRoute`, and `RoleGuard` wrapper components.
- **Design System**: Square Classic Aesthetic – 1px neutral borders, sharp/subtle radiuses, strict grid layouts, editorial typography, restrained micro-interactions, responsive CSS variables.
- **State Management**: React Context + Custom Hooks (`useAuth`, `useCart`, `useDebounce`, `useProducts`) avoiding heavy external state libraries (no Redux).
- **API Integration**: Axios instance with request/response interceptors for automatic Bearer token attach, silent token refresh, error formatting, and CSRF support.

### 2. Backend Architecture (Django REST Framework)
- **Core Technology**: Django 5 with DRF 3.15+.
- **Modular Apps**:
  - `apps.users`: Custom User model with roles (`USER`, `ADMIN`, `SUPER_ADMIN`).
  - `apps.products`: Categories, Brands, Products, Product Images, Product Variants.
  - `apps.cart`: Persistent and guest-mergeable Cart and CartItems.
  - `apps.addresses`: Multi-address book management per user.
  - `apps.orders`: Order creation, OrderItem price snapshots, Atomic stock deduction, Status history.
  - `apps.reviews`: Purchase-verified product reviews with dynamic rating calculation.
  - `apps.admin_management`: Seller profiles and admin operations.
  - `apps.inspections`: Inspection workflow, DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED/REJECTED state machine.
  - `apps.audit_logs`: Audit trail for administrative actions.
- **Response Format**: Standardized API Envelope:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": { ... }
  }
  ```

### 3. Database Architecture (PostgreSQL)
- **Primary Database**: PostgreSQL 17.
- **Key Schema Practices**:
  - Full B-tree indexing on search/filter columns (`category_id`, `brand_id`, `status`, `created_at`, `price`).
  - Composite indexes on `(status, is_active)` for public API fast querying.
  - Hard constraint validations (Decimal fields for prices, non-negative stock constraints).
  - Snapshot fields: `OrderItem` stores `price_at_purchase` and `product_name_at_purchase` to ensure historical order immutability.

---

## Security Strategy

1. **Authentication & JWT Tokens**: Short-lived Access Token (15 mins), Refresh Token (7 days). Secure storage options.
2. **Role-Based Access Control (RBAC)**: Custom DRF permission classes (`IsUser`, `IsAdmin`, `IsSuperAdmin`, `IsSellerOwnerOrSuperAdmin`).
3. **Backend-Driven Price & Stock Enforcement**: Prices are ALWAYS read from DB on cart total & checkout calculation. Frontend totals are ignored.
4. **Product Inspection Security**: Public endpoints strictly query `Product.objects.filter(status='APPROVED', is_active=True)`. Unapproved items are unreachable by non-admin users.
5. **Atomic Stock Locking**: `select_for_update()` in database transactions during checkout to prevent overselling race conditions.
6. **Input Sanitization & Upload Safety**: File extension, mime-type, and size validation for images.

---

## Product & Inspection Workflow

```
[ ADMIN / SELLER ]                      [ SUPER ADMIN ]                     [ PUBLIC FRONTEND ]
        │                                      │                                    │
        │ 1. Create Product (Status: DRAFT)    │                                    │
        ├───► Saved as DRAFT                   │                                    │
        │                                      │                                    │
        │ 2. Submit for Inspection             │                                    │
        ├───► Status -> SUBMITTED ────────────►│                                    │
        │                                      │ 3. Review Product Specs & Images  │
        │                                      ├──────┬─────────────────────────────┤
        │                                      │      │                             │
        │                                      │   [APPROVE]                    [REJECT]
        │                                      │      │                             │
        │                                      │      ▼                             ▼
        │                                      │ Status: APPROVED           Status: REJECTED
        │                                      │ (Visible on Site)          (Reason Recorded)
        │                                      │      │                             │
        │◄─────────────────────────────────────┼──────┴─────────────────────────────┤
        │ 4. Receive Rejection Reason & Edit   │                                    │
        └───► Edit product -> Resubmit ────────┘                                    │
```

---

## Order & Checkout Workflow

1. User adds items to Cart (backend validates stock & current price).
2. User proceeds to Checkout, chooses/creates Address, selects Payment Method (Cash on Delivery / COD).
3. Backend starts atomic transaction:
   - Locks product stock rows (`select_for_update`).
   - Validates available stock >= requested quantity.
   - Deducts stock from products/variants.
   - Creates `Order` and snapshot `OrderItem` rows with frozen unit prices.
   - Clears cart items.
4. User receives Order Confirmation with tracking lifecycle (`PENDING` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).

---

## Deployment & Production Strategy

- **Backend**: Gunicorn WSGI server behind Nginx / Cloudflare, running Django with `DEBUG=False`.
- **Frontend**: Static production build via Vite deployed to Vercel/Netlify/S3+CloudFront.
- **Database**: Managed PostgreSQL instance (AWS RDS / Supabase / Neon / Render Postgres).
