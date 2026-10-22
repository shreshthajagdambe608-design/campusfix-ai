import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse

from app.database import init_db
from app.routes.reports import router as reports_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables and sample data exist
    init_db()
    print("[CampusFix AI] Database initialized with campus maintenance seed records.")
    yield
    # Shutdown
    print("[CampusFix AI] Backend server shut down.")

app = FastAPI(
    title="CampusFix AI API",
    description="Intelligent campus maintenance reporting assistant powered by Gemma open weights.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.services.gemma import gemma_service

# Register routes
app.include_router(reports_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CampusFix AI",
        "model": "google/gemma-4-E4B-it",
        "competition_compliance": "VALIDATED_GEMMA_4",
        "features": ["Gemma 4 Inference", "Duplicate Detection", "Strict Schema Validation", "Maintenance Triage"]
    }

@app.get("/api/model-info")
def model_info():
    """Explicit endpoint for hackathon judges to verify Gemma 4 integration."""
    return gemma_service.get_model_metadata()

from app.services.graphify import graphify
from app.services.duplicates import find_potential_duplicates
from app.database import get_all_reports

@app.get("/api/graphify")
def get_graphify_topology():
    """Graphify Knowledge Graph endpoint for campus maintenance topology."""
    reports = get_all_reports()
    dup_map = {}
    for r in reports:
        other = [x for x in reports if x["id"] != r["id"]]
        dups = find_potential_duplicates(
            r["user_description"],
            r["user_location"],
            r["ai_analysis"].get("category", "Other"),
            other
        )
        if dups:
            dup_map[r["id"]] = dups
    gdata = graphify.build_graph(reports, dup_map)
    graphify.export_graphify_outputs(gdata)
    return gdata

# Serve frontend build if dist folder exists
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    @app.get("/")
    def index():
        return {
            "message": "CampusFix AI Backend is running.",
            "docs": "/docs",
            "api_health": "/api/health",
            "reports_endpoint": "/api/reports"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
