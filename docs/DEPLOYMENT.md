# Production Deployment Guide

This guide provides instructions for deploying the full-stack e-commerce application using free/open-source friendly hosting providers.

---

## Architecture Overview for Deployment

```
[ Frontend: Static Build (Vercel / Netlify) ]
                       │
                       │ HTTPS API Requests
                       ▼
[ Backend: Gunicorn WSGI Server (Render / Railway) ]
                       │
                       │ SQL Connection
                       ▼
[ Database: Managed PostgreSQL (Supabase / Neon / Render Postgres) ]
```

---

## Step 1: Managed PostgreSQL Setup (Supabase / Neon)

1. Create a free PostgreSQL instance on Supabase or Neon.
2. Retrieve the PostgreSQL connection string:
   `postgres://<user>:<password>@<host>:5432/<dbname>`

---

## Step 2: Backend Deployment (Render / Railway)

1. Connect repository `backend/` directory to Render Web Service.
2. Set Environment Variables:
   - `DEBUG=False`
   - `SECRET_KEY=<generate-strong-random-key>`
   - `ALLOWED_HOSTS=your-app.onrender.com`
   - `DATABASE_ENGINE=postgresql`
   - `DATABASE_NAME=<dbname>`
   - `DATABASE_USER=<user>`
   - `DATABASE_PASSWORD=<password>`
   - `DATABASE_HOST=<host>`
   - `DATABASE_PORT=5432`
3. Build Command:
   `pip install -r backend/requirements.txt && python backend/ecommerce/manage.py migrate && python backend/ecommerce/manage.py seed_data`
4. Start Command:
   `gunicorn --chdir backend/ecommerce config.wsgi:application`

---

## Step 3: Frontend Deployment (Vercel / Netlify)

1. Connect repository `frontend/` directory to Vercel.
2. Set Environment Variable:
   - `VITE_API_URL=https://your-app.onrender.com/api`
3. Build Command: `npm run build`
4. Output Directory: `dist`
