# Security Architecture & Hardening Guide

## 1. Authentication & JWT Tokens
- Authentication uses JSON Web Tokens (PyJWT).
- Access tokens expire in 60 minutes. Refresh tokens expire in 7 days.
- Passwords are encrypted using Django's default PBKDF2 algorithm with SHA256 hashing. Passwords are NEVER stored in plaintext.

## 2. Role-Based Access Control (RBAC)
- Enforced strictly on backend views via DRF permissions:
  - `IsUser`: Standard customer endpoints (cart, orders, addresses, profile).
  - `IsAdmin`: Seller endpoints (create products, update inventory, manage order fulfillment).
  - `IsSuperAdmin`: Platform governance endpoints (product inspection queue approve/reject, admin creation, user deactivation, audit logs).

## 3. Product Inspection Security Boundary
- Public endpoint (`GET /api/products/public/`) enforces hard SQL query filter:
  `Product.objects.filter(status='APPROVED', is_active=True)`
- Non-approved items (`DRAFT`, `SUBMITTED`, `REJECTED`) are strictly inaccessible to public catalog requests.

## 4. Financial & Price Tampering Defense
- Prices and totals submitted by client requests are ignored.
- Checkout pricing is computed strictly from backend database records during checkout execution.

## 5. Stock Overselling Defense
- Checkout executes within `django.db.transaction.atomic()`.
- Rows are locked using `select_for_update()` before stock validation and decrementing.
