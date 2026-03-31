from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from auth import router as auth_router
from routers.tasks import router as tasks_router
from routers.ai import router as ai_router

# ✅ CREATE APP FIRST
app = FastAPI()

# ✅ DATABASE INIT
Base.metadata.create_all(bind=engine)

# ✅ CORS (AFTER app creation ONLY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-neuro-flow.netlify.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROUTES
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
