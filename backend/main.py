from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  
from auth import router as auth_router
from routers.tasks import router as tasks_router
from routers.ai import router as ai_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeuroFlow AI API",
    description="Personal Execution Engine – AI-powered goal decomposition and task management",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(ai_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NeuroFlow AI API"}
