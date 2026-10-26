import sys
import os
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import voices, generations, media

app = FastAPI(
    title="Photo-to-Video AI Generator API",
    description="Backend API converting photo + script + Piper voice into a talking-head AI video.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(voices.router)
app.include_router(generations.router)
app.include_router(media.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "photo-to-video-api",
        "models_ready": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
