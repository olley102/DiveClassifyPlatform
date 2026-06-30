# OceanClassify

A citizen science web platform for marine habitat monitoring. Users upload underwater photographs geotagged with coordinates and depth, and the platform classifies the habitat type (coral, kelp, seagrass, etc.) — either automatically via an AI model or manually by the user. All observations are displayed on a public interactive map.

---

## Features

- **User accounts** — registration, login, and role-based access (User / Admin)
- **Observation upload** — single or batch JPEG/PNG upload with latitude, longitude, depth, and notes
- **AI classification** — automatic habitat labelling with confidence score *(placeholder — see below)*
- **Manual labelling** — users can set or override the habitat label on any observation
- **Verification workflow** — each observation carries a status: `pending`, `certain`, `flagged`, or `rejected`
- **Interactive map** — Leaflet map showing all geotagged observations; click a marker to view the image and metadata
- **Admin tools** — list all users, promote/demote roles

---

## Tech Stack

### Backend

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI (Python) |
| Database | SQLite via SQLAlchemy ORM |
| Auth | JWT (HS256) + bcrypt password hashing |
| Validation | Pydantic v2 |
| Tests | Pytest |

Key files:

```
backend/app/
├── main.py              # App entry point, CORS, startup
├── models.py            # SQLAlchemy models (User, Upload) and enums
├── schemas.py           # Pydantic request/response schemas
├── crud.py              # Database operations
├── auth.py              # JWT creation and verification
├── database.py          # SQLAlchemy engine and session
├── routers/
│   ├── users.py         # /users endpoints
│   ├── uploads.py       # /uploads endpoints + file serving
│   └── token.py         # /token login endpoint
└── utils/
    └── ai_processing.py # AI classification hook (see below)
```

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 7 |
| HTTP client | Axios (with JWT interceptor) |
| Forms | React Hook Form |
| Map | React-Leaflet + Leaflet |
| Icons | Lucide React |

Key pages:

| Route | Page | Auth required |
|-------|------|:---:|
| `/map` | Public map of all observations | No |
| `/login` | Login | No |
| `/signup` | Registration | No |
| `/dashboard` | Personal observations + map | Yes |
| `/upload` | Single image upload | Yes |

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/token` | Login — returns JWT access token |

### Users
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/users/` | Create account (signup) |
| `GET` | `/users/` | List all users *(Admin only)* |
| `GET` | `/users/me` | Current user profile |
| `GET` | `/users/{username}` | User profile by username |
| `GET` | `/users/{username}/uploads` | User's observations (paginated) |
| `PUT` | `/users/{username}/role` | Change role *(Admin only)* |

### Uploads / Observations
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/uploads/` | Upload image with metadata |
| `GET` | `/uploads/` | List all observations (paginated) |
| `GET` | `/uploads/{id}` | Single observation detail |
| `PUT` | `/uploads/{id}/label` | Set or update user-defined label |
| `PUT` | `/uploads/{id}/classify` | Run AI classification on the image |
| `GET` | `/files/{filename}` | Serve stored image file |

---

## Data Model

### Upload (observation)

| Field | Type | Notes |
|-------|------|-------|
| `id` | int | Primary key |
| `filename` | str | Original file name |
| `storage_filename` | str | UUID-based on-disk name |
| `timestamp` | datetime | UTC upload time |
| `lat` / `lon` | float \| null | GPS coordinates |
| `depth` | float \| null | Depth in metres |
| `notes` | str \| null | Free-text notes |
| `label` | str \| null | Habitat label (e.g. `coral`) |
| `label_type` | enum | `no_label` / `user_defined` / `model_defined` |
| `model_confidence` | float \| null | ML confidence score (0–1) |
| `verification_status` | enum | `pending` / `certain` / `flagged` / `rejected` |

---

## AI Classification *(placeholder)*

The classification pipeline lives in [backend/app/utils/ai_processing.py](backend/app/utils/ai_processing.py).

The `classify_image(image_path)` function currently returns a **random** label from `["seagrass", "coral", "kelp"]` as a stand-in. This is where the real model integration will go — the function should return a `(label: str, confidence: float)` tuple. The upload router at `PUT /uploads/{id}/classify` calls this function and stores the result.

The frontend `BatchUploadForm` already handles the upload → classify pipeline sequentially per file and displays real-time per-image progress.

---

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Running tests

```bash
cd backend
pytest
```

---

## Configuration

The following values are currently hardcoded and should be moved to environment variables before any deployment:

| Setting | Location | Notes |
|---------|----------|-------|
| `SECRET_KEY` | `auth.py` | JWT signing secret |
| `DATABASE_URL` | `database.py` | Defaults to SQLite; switch to PostgreSQL for production |
| `UPLOAD_DIR` | `routers/uploads.py` | Path where images are stored |
| CORS origins | `main.py` | Currently allows `http://localhost:5173` only |

---

## Project Structure

```
dive_data_platform/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── routers/
│   │   │   ├── users.py
│   │   │   ├── uploads.py
│   │   │   └── token.py
│   │   └── utils/
│   │       └── ai_processing.py   ← AI classification hook
│   └── tests/
└── frontend/
    └── src/
        ├── api/api.ts
        ├── assets/
        │   ├── colors.json
        │   └── strings.json
        ├── components/
        │   ├── BatchUploadForm.tsx
        │   ├── LoginForm.tsx
        │   ├── MapView.tsx
        │   ├── SignupForm.tsx
        │   ├── UploadDetail.tsx
        │   └── UploadForm.tsx
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── LoginPage.tsx
        │   ├── MapPage.tsx
        │   ├── SignupPage.tsx
        │   └── UploadPage.tsx
        └── App.tsx
```
