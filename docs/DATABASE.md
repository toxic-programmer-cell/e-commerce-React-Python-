# Database Architecture & ERD Specification

## Database Engine
- **Target Engine**: PostgreSQL 17
- **ORM**: Django ORM
- **Migration Strategy**: Version-controlled migrations in `apps/*/migrations/`

---

## Entity Relationship Summary

```
   ┌──────────────┐
   │    users     │◄─────────────────┐
   └──────┬───────┘                  │
          │ 1:N                      │ 1:N
          ▼                          │
   ┌──────────────┐          ┌───────┴──────┐
   │   products   │◄─────────┤    orders    │
   └──────┬───────┘ 1:N      └───────┬──────┘
          │                          │ 1:N
          ▼                          ▼
   ┌──────────────┐          ┌──────────────┐
   │product_images│          │ order_items  │
   └──────────────┘          └──────────────┘
```

## Key Relational Models & Indexes

### 1. `users` Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique, B-Tree Index)
- `role` (VARCHAR: `USER`, `ADMIN`, `SUPER_ADMIN`)
- `password` (VARCHAR, PBKDF2 / Argon2 hashed)
- `is_active` (BOOLEAN)

### 2. `products` Table
- `id` (UUID, Primary Key)
- `seller_id` (FK to `users.id`)
- `category_id` (FK to `categories.id`)
- `brand_id` (FK to `brands.id`, Nullable)
- `name`, `slug` (Unique), `sku` (Unique)
- `price` (DECIMAL 12,2), `discount_price` (DECIMAL 12,2)
- `stock` (UNSIGNED INT)
- `status` (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `INACTIVE`)
- `rejection_reason` (TEXT)
- **Indexes**:
  - `(status, is_active)`
  - `(category_id, status)`
  - `(price)`
  - `(created_at)`

### 3. `orders` & `order_items` Tables
- `orders.id` (UUID, Primary Key)
- `orders.order_number` (VARCHAR, Unique)
- `orders.user_id` (FK to `users.id`)
- Address Snapshots (`shipping_name`, `shipping_phone`, `shipping_address_line_1`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`)
- `order_items.unit_price` (DECIMAL 12,2) - **Frozen price at purchase**
- `order_items.product_name` - **Snapshot product title at purchase**

### 4. `product_inspections` & `audit_logs`
- Stores history of approvals, rejections, rejection reasons, administrative actor IDs, and IP address metadata.
