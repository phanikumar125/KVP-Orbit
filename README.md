# KVP Orbit

KVP Orbit is a career-readiness workspace built from the supplied PRD and adapted to the requested stack:

- `frontend/` — Next.js App Router, TypeScript, Tailwind CSS, and Magic UI-inspired primitives (`MagicCard` styling, animated grain, dot-grid, shimmer/floating accents).
- `backend/` — FastAPI, SQLAlchemy, PostgreSQL, JWT authentication, bcrypt password hashing, and optional Cloudinary image storage.
- Resume MVP — registration/login, protected dashboard, resume CRUD, six-step builder, live preview, five templates, profile image upload, and client-side PDF export.

## Run locally

1. Start PostgreSQL and create a database named `kvp_orbit`.
2. Copy `backend/.env.example` to `backend/.env` and update the database URL and JWT secret.
3. Install backend dependencies and run FastAPI:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

4. Install and run the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   The frontend defaults to `http://localhost:8000` for the API. Set `NEXT_PUBLIC_API_URL` when deploying the services separately.

