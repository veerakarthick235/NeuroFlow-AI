from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# other imports...
from database import engine, Base
import models
from auth import router as auth_router
from routers.tasks import router as tasks_router
from routers.ai import router as ai_router

# ✅ 1. CREATE APP FIRST
app = FastAPI(
    title="NeuroFlow AI API",
    version="1.0.0",
)

# ✅ 2. DATABASE
Base.metadata.create_all(bind=engine)

# ✅ 3. CORS (PASTE HERE 👇)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-neuro-flow.netlify.app",
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 4. ROUTERS
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(ai_router)

# ✅ 5. HEALTH
@app.get("/health")
def health_check():
    return {"status": "ok"}
