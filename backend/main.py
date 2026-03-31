from fastapi.middleware.cors import CORSMiddleware
import os

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

# Add deployed frontend dynamically
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
