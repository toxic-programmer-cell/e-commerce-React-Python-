# E-Commerce API Documentation

All API endpoints follow a standardized JSON envelope structure.

### Success Response Envelope
```json
{
  "success": true,
  "message": "Operation successful description",
  "data": { ... },
  "errors": {}
}
```

### Error Response Envelope
```json
{
  "success": false,
  "message": "Detailed error message",
  "data": {},
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

---

## 1. Authentication Endpoints (`/api/auth/`)

### Register Customer User
- **URL**: `POST /api/auth/register/`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123!",
    "password_confirm": "Password123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1 555-0192"
  }
  ```

### Login
- **URL**: `POST /api/auth/login/`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```

### Refresh Token
- **URL**: `POST /api/auth/refresh/`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "refresh_token": "<refresh_jwt>"
  }
  ```

### Get Profile
- **URL**: `GET /api/auth/me/`
- **Auth Required**: Yes (Bearer Token)

---

## 2. Product Catalog Endpoints (`/api/products/`)

### Public Catalog Listing (Server-side Search/Filter/Sort/Paginate)
- **URL**: `GET /api/products/public/`
- **Auth Required**: No
- **Query Parameters**:
  - `search` (string): Searches name, description, SKU, brand, category.
  - `category` (string): Filter by category slug (e.g. `electronics`).
  - `brand` (string): Filter by brand slug.
  - `min_price` (number): Minimum price threshold.
  - `max_price` (number): Maximum price threshold.
  - `ordering` (string): Sort field (`-created_at`, `created_at`, `price`, `-price`, `rating`).
  - `page` (number): Page number (default: 1).
  - `page_size` (number): Items per page (default: 20, max: 50).
- **Security Rule**: Strictly returns products with `status='APPROVED'` and `is_active=True`.

### Public Product Detail
- **URL**: `GET /api/products/public/<id_or_slug>/`
- **Auth Required**: No

### Admin Product Creation
- **URL**: `POST /api/products/admin/create/`
- **Auth Required**: Yes (Role: `ADMIN` or `SUPER_ADMIN`)
- **Initial Status**: `DRAFT`

### Admin Submit for Inspection
- **URL**: `POST /api/products/admin/<id>/submit-inspection/`
- **Auth Required**: Yes (Role: `ADMIN` or `SUPER_ADMIN`)
- **Status Transition**: `DRAFT` / `REJECTED` -> `SUBMITTED`

---

## 3. SuperAdmin Governance Endpoints (`/api/super-admin/`)

### Inspection Queue
- **URL**: `GET /api/super-admin/inspections/queue/`
- **Auth Required**: Yes (Role: `SUPER_ADMIN`)

### Approve Product
- **URL**: `POST /api/super-admin/inspections/<product_id>/approve/`
- **Auth Required**: Yes (Role: `SUPER_ADMIN`)

### Reject Product
- **URL**: `POST /api/super-admin/inspections/<product_id>/reject/`
- **Auth Required**: Yes (Role: `SUPER_ADMIN`)
- **Body**:
  ```json
  {
    "rejection_reason": "Missing clear specification for acoustic drivers.",
    "notes": "Please update description and resubmit."
  }
  ```

---

## 4. Cart & Checkout Endpoints (`/api/cart/` & `/api/orders/`)

### Get Cart
- **URL**: `GET /api/cart/`

### Add Item to Cart
- **URL**: `POST /api/cart/add/`
- **Body**:
  ```json
  {
    "product_id": "<uuid>",
    "quantity": 2
  }
  ```

### Atomic Order Checkout (COD)
- **URL**: `POST /api/orders/checkout/`
- **Auth Required**: Yes (Role: `USER`, `ADMIN`, `SUPER_ADMIN`)
- **Body**:
  ```json
  {
    "address_id": "<uuid>",
    "payment_method": "COD",
    "notes": "Ring doorbell on delivery."
  }
  ```
