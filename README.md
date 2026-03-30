# NeuroFlow AI – Personal Execution Engine

> **Transform goals into structured execution plans with AI.** A production-ready SaaS-style productivity app featuring AI-powered task decomposition, smart insights, and daily summaries.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Goal Decomposer** | Enter any goal → AI generates step-by-step tasks with priorities & time estimates |
| ✅ **Task Management** | Full CRUD: create, edit, complete, delete tasks with priority & status tracking |
| 📊 **Smart Dashboard** | Animated progress ring, stats cards, recent tasks overview |
| 💡 **AI Productivity Insights** | Analyzes your task patterns → actionable coaching suggestions |
| 📋 **Daily Summary** | AI-generated daily recap with productivity score & tomorrow's tips |
| 🔐 **JWT Authentication** | Secure register/login with token persistence |

---

## 🏗️ Architecture

```
neuroflow-ai/
├── backend/               # FastAPI (Python)
│   ├── main.py            # App entry, CORS, DB init
│   ├── config.py          # Env var settings
│   ├── database.py        # SQLAlchemy engine (SQLite/PostgreSQL)
│   ├── models.py          # User, Task ORM models
│   ├── schemas.py         # Pydantic schemas
│   ├── auth.py            # JWT auth + /register /login /me
│   ├── routers/
│   │   ├── tasks.py       # GET/POST/PUT/DELETE /tasks
│   │   └── ai.py          # /generate-tasks /insights /daily-summary
│   └── services/
│       └── ai_service.py  # OpenAI integration + smart fallbacks
└── frontend/              # React 18 + Vite + Tailwind CSS
    └── src/
        ├── api/client.js  # Axios + JWT interceptors
        ├── contexts/      # AuthContext
        ├── pages/         # Login, Register, Dashboard, Tasks, Insights
        └── components/    # Navbar, TaskCard, GoalInput, InsightCard, ...
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) PostgreSQL or just use the zero-config **SQLite** default

---

### 1. Backend

```bash
cd "neuroflow-ai/backend"

# Install dependencies
pip install -r requirements.txt

# Configure environment (already copied, edit if needed)
# DATABASE_URL defaults to SQLite – no setup required
notepad .env   # or your editor of choice

# Start the API server
uvicorn main:app --reload --port 8001
```

> **API docs:** http://localhost:8001/docs (Swagger UI)

---

### 2. Frontend

```bash
cd "neuroflow-ai/frontend"

# Install dependencies
npm install

# Start the dev server
npm run dev
```

> **App:** http://localhost:5173

---

### 3. OpenAI (Optional)

The app works **fully offline with intelligent dummy data**. To enable real AI:

1. Get an API key at https://platform.openai.com
2. Open `backend/.env` and set:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart the backend

---

## 🗃️ Database Schema

```sql
CREATE TABLE users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name      VARCHAR(255),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(500) NOT NULL,
  description    TEXT,
  priority       VARCHAR(20) DEFAULT 'medium',   -- low | medium | high
  status         VARCHAR(20) DEFAULT 'pending',   -- pending | in_progress | completed
  estimated_time VARCHAR(100),
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);
```

*Tables are auto-created on first run — no migrations needed for local dev.*

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Get JWT token |
| GET | `/me` | Current user info |
| GET | `/tasks` | List user tasks (filterable) |
| POST | `/tasks` | Create task |
| PUT | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/generate-tasks` | AI-decompose a goal into tasks |
| GET | `/insights` | AI productivity insights |
| GET | `/daily-summary` | Today's AI summary + score |

---

## 🎨 Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Recharts · Lucide Icons · React Router v6 · Axios

**Backend:** FastAPI · SQLAlchemy · Pydantic v2 · python-jose (JWT) · passlib (bcrypt) · OpenAI SDK

**Database:** SQLite (default) / PostgreSQL (supported)

---

## 🔧 Environment Variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./neuroflow.db` | DB connection string |
| `SECRET_KEY` | (dev key) | JWT signing secret – **change in production** |
| `OPENAI_API_KEY` | *(empty)* | Leave blank for smart dummy data |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | 7 days |

---

## 🛠️ Development Notes

- **CORS** is pre-configured for `localhost:5173` and `localhost:3000`
- **SQLite** uses WAL mode for better concurrent reads
- **AI fallback** provides rich, realistic demo data — the app is fully functional without any API keys
- All AI responses fall back gracefully if OpenAI is unavailable

---

*Built with ❤️ using FastAPI + React + Tailwind CSS*
