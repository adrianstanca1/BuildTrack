"""BuildTrack API — Production FastAPI Backend

Construction management API with Supabase integration.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("buildtrack")

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="BuildTrack API",
    description="Construction management backend — projects, tasks, safety, team",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ─── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info(
        "%s %s → %d (%.3fs)",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    return response


# ─── Routers ──────────────────────────────────────────────────────────────────

from .routers import projects, tasks, safety, workers, dashboard, uploads

app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(safety.router, prefix="/api")
app.include_router(workers.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health", tags=["health"])
async def health_check():
    """Health check — returns service status plus downstream connectivity."""
    status = {
        "status": "healthy",
        "service": "buildtrack-api",
        "version": app.version,
    }

    # Check Supabase connectivity
    try:
        from .services import get_supabase

        supabase = get_supabase()
        result = supabase.table("projects").select("id", count="exact").limit(1).execute()
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"unavailable: {str(e)}"
        status["status"] = "degraded"

    return status


# ─── Error handling ───────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__},
    )
