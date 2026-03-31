from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from auth import router as auth_router
from routers.tasks import router as tasks_router
from routers.ai import router as ai_router
import os

# ✅ Create app FIRST
app = FastAPI(
    title="NeuroFlow AI API",
    description="Personal Execution Engine – AI-powered goal decomposition and task management",
    version="1.0.0",
)

# ✅ Database
Base.metadata.create_all(bind=engine)

# ✅ CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://ai-neuro-flow.netlify.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(ai_router)

# ✅ Health check
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NeuroFlow AI API"}
