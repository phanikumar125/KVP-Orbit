# KVP Orbit API

FastAPI + PostgreSQL backend for the KVP Orbit resume platform.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Set `DATABASE_URL` to a PostgreSQL database before starting. The upload route uses local `uploads/` storage when Cloudinary credentials are not configured, and transparently switches to Cloudinary when all three credentials are present.
