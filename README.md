# Full-Stack E-Commerce Platform

A production-ready full-stack e-commerce platform built with a decoupled architecture (React.js frontend, Django REST Framework backend, and PostgreSQL relational database). Features a classic "Square" geometric design system, role-based access control (User, Admin, SuperAdmin), a SuperAdmin product inspection state machine, server-side search/filter/sort/pagination, and atomic order stock deduction.

---

## 1. Project Overview
Vibe Square is an enterprise-grade full-stack e-commerce solution. It enforces a strict product inspection workflow: products created by Seller Admins start as `DRAFT` items and must be submitted to and approved by SuperAdmins before appearing on the public store.

## 2. Main Features
- **Square Classic Aesthetic**: Geometric layouts, strong rectangular cards, crisp typography, clean grids, restrained micro-interactions, responsive design.
- **Server-side Search, Filtering, Sorting & Pagination**: Query execution happens entirely in Django ORM with database indexing.
- **Multi-Role Access Control (RBAC)**: Distinct permissions for `USER`, `ADMIN` (Seller), and `SUPER_ADMIN` (Platform Governor).
- **Product Inspection Workflow**: `DRAFT` → `SUBMITTED` → `APPROVED` / `REJECTED`. Rejected products store explicit feedback for seller re-submission.
- **Atomic Stock Management**: Database transactions use `select_for_update()` row locks during checkout to eliminate race conditions.
- **Verified Purchaser Reviews**: Reviews are strictly restricted to customers who purchased the item in a delivered order.
- **Cash on Delivery (COD)**: Zero-dependency payment method with clean abstraction for future online payment gateways.

## 3. Technology Stack
- **Frontend**: React 18, React Router v6, Axios, Lucide Icons, Vanilla CSS Design System.
- **Backend**: Python 3.13, Django 5, Django REST Framework, PyJWT, Pillow, django-filter.
- **Database**: PostgreSQL 17 (development fallback to SQLite `db.sqlite3`).

## 4. System Architecture
Decoupled client-server architecture communicating over REST APIs with standard JSON response envelopes (`{ success, message, data, errors }`).

## 5. Folder Structure
```
Major-project-1/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/          # Axios instance & token interceptors
│   │   ├── components/   # Common, Layout, Product, Cart, Auth components
│   │   ├── features/     # AuthContext & state providers
│   │   ├── pages/        # Shop, Account, Checkout, Admin, SuperAdmin pages
│   │   ├── services/     # API service modules
│   │   └── index.css     # Square design system tokens
│   └── package.json
├── backend/
│   ├── myenv/            # Python virtual environment
│   ├── ecommerce/
│   │   ├── manage.py
│   │   ├── config/       # Settings package & root URLs
│   │   ├── apps/         # Domain apps (users, products, cart, orders, etc.)
│   │   └── common/       # Permissions, exceptions, pagination, auth helpers
│   └── requirements.txt
├── docs/                 # ARCHITECTURE, API, DATABASE, SECURITY, DEPLOYMENT specs
├── .env.example
└── README.md
```

## 6. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

## 7. Backend Setup
```powershell
cd backend
myenv\Scripts\activate
cd ecommerce
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

## 8. PostgreSQL / Database Setup
Configure environment variables in `.env` to connect to PostgreSQL:
```env
DATABASE_ENGINE=postgresql
DATABASE_NAME=ecommerce_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## 9. Environment Variable Setup
Copy `.env.example` to `.env` in the project root:
```powershell
cp .env.example .env
```

## 10. `.env.example` Explanation
- `SECRET_KEY`: Django cryptographic signing key.
- `DEBUG`: Set to `True` for development, `False` for production.
- `DATABASE_ENGINE`: Choice between `postgresql` or `sqlite`.
- `VITE_API_URL`: Backend API endpoint base URL.

## 11. Authentication Setup
JWT Bearer token authentication. Login returns short-lived `access_token` and long-lived `refresh_token`.

## 12. Role-Based Access Control Explanation
- `USER`: Browse catalog, manage own cart, address book, place orders, write reviews.
- `ADMIN`: Create & edit products (starts in `DRAFT`), submit for inspection, manage seller orders.
- `SUPER_ADMIN`: Review inspection queue, approve/reject products with reason, create admins, toggle user accounts, inspect audit logs.

## 13. User Workflow
Register → Browse Approved Store Catalog → Add to Cart → Select Address → Checkout (COD) → Track Order.

## 14. Admin Workflow
Login → Seller Dashboard → Create Product (DRAFT) → Submit for Inspection → Fulfill Seller Orders.

## 15. SuperAdmin Workflow
Login → SuperAdmin Controller → Inspection Queue → Review Specs → Approve / Reject with Reason → Manage Users/Admins → View Audit Logs.

## 16. Product Inspection Workflow
State machine: `DRAFT` → `SUBMITTED` → `APPROVED` (published to public site) OR `REJECTED` (with rejection reason).

## 17. Product Search/Filter/Sort/Pagination Explanation
All processing is executed server-side via Django ORM:
`GET /api/products/public/?search=phone&category=electronics&min_price=100&ordering=-price&page=1`

## 18. Cart and Checkout Workflow
Client requests add/update item → Server computes price & validates stock → Checkout locks stock rows atomically → Order created & Cart cleared.

## 19. Order and Delivery Workflow
Order lifecycle: `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`.

## 20. Review Workflow
Customers can review products only if an `OrderItem` exists in a `DELIVERED` order. Recalculates product rating average dynamically.

## 21. API Overview
RESTful architecture returning standard envelopes: `{ success: true, message: "...", data: {}, errors: {} }`.

## 22. Important API Endpoints
- `POST /api/auth/login/`: User Login.
- `GET /api/products/public/`: Public Catalog.
- `POST /api/products/admin/create/`: Admin Create Product.
- `POST /api/super-admin/inspections/<id>/approve/`: SuperAdmin Approve.
- `POST /api/orders/checkout/`: Atomic Checkout.

## 23. Database Structure Overview
Normalized SQL schema with models `User`, `Category`, `Brand`, `Product`, `ProductImage`, `ProductVariant`, `Cart`, `CartItem`, `Address`, `Order`, `OrderItem`, `Review`, `ProductInspection`, `AuditLog`.

## 24. How to Run Backend
```powershell
$env:DATABASE_ENGINE="sqlite"; backend/myenv/Scripts/python.exe backend/ecommerce/manage.py runserver 8000
```

## 25. How to Run Frontend
```powershell
cd frontend
npm run dev
```

## 26. How to Run Tests
```powershell
$env:DATABASE_ENGINE="sqlite"; backend/myenv/Scripts/python.exe backend/ecommerce/manage.py test apps.users apps.products
```

## 27. How to Create Migrations
```powershell
backend/myenv/Scripts/python.exe backend/ecommerce/manage.py makemigrations
```

## 28. How to Apply Migrations
```powershell
backend/myenv/Scripts/python.exe backend/ecommerce/manage.py migrate
```

## 29. How to Create a Development Account
Run `python manage.py seed_data` to automatically create:
- SuperAdmin: `superadmin@vibe.com` / `SuperAdmin123!`
- Seller Admin: `admin@techstore.com` / `Admin123!`
- Customer User: `user@example.com` / `User123!`

## 30. Production Build Instructions
```powershell
cd frontend
npm run build
```

## 31. Deployment Instructions
Refer to `docs/DEPLOYMENT.md` for complete guide on deploying backend to Render/Railway, database to Supabase/Neon, and frontend to Vercel/Netlify.

## 32. Security Considerations
- Password hashing (PBKDF2 SHA256).
- JWT Token auth with expiration.
- Price tampering protection.
- SQL injection protection via ORM.

## 33. Performance Considerations
- Database indexes on `(status, is_active)`, `price`, `created_at`.
- Efficient query handling with `select_related` and `prefetch_related`.

## 34. Dependency List and Reasons
- `Django`: Web framework & ORM engine.
- `djangorestframework`: REST API toolkit & serializers.
- `PyJWT`: JSON Web Token authentication.
- `psycopg2-binary`: PostgreSQL database driver.
- `Pillow`: Image upload processing.
- `react-router-dom`: Frontend SPA routing.
- `axios`: HTTP client with request/response interceptors.
- `lucide-react`: Lightweight UI icon set.

## 35. Known Limitations
- Initial payment gateway relies on Cash on Delivery (online payment gateway integrations ready via abstraction).

## 36. Future Improvements
- Stripe / PayPal online payment integration.
- Elasticsearch integration for large multi-million product catalogs.

## 37. Troubleshooting Section
- If backend throws DB connection error, ensure PostgreSQL service is running or set `DATABASE_ENGINE=sqlite`.

## 38. Development Conventions
- Feature-based frontend component organization.
- Modular Django domain apps under `backend/ecommerce/apps/`.

## 39. Environment Variables Reference
Detailed in `.env.example`.

## 40. Default Development Workflow
1. Start backend server at `http://localhost:8000`.
2. Start frontend dev server at `http://localhost:5173`.
3. Login using seeded credentials.
