"""
AILocalFileManager - Main FastAPI Application
A privacy-first, intelligent file organization system
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.database import init_db
from app.api import analysis, suggestions, operations, rules, insights
from app.utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    logger.info("🚀 Starting AILocalFileManager...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("🛑 Shutting down AILocalFileManager...")


# Create FastAPI app
app = FastAPI(
    title="AILocalFileManager API",
    description="Intelligent file organization with local AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
if settings.ENABLE_CORS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS != "*" else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = datetime.now()
    
    response = await call_next(request)
    
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(
        f"{request.method} {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Time: {process_time:.3f}s"
    )
    
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle global exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred",
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AILocalFileManager",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "AILocalFileManager API",
        "version": "1.0.0",
        "description": "Intelligent file organization with local AI",
        "docs": "/docs",
        "health": "/health",
    }


# Include routers
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(suggestions.router, prefix="/api/v1", tags=["Suggestions"])
app.include_router(operations.router, prefix="/api/v1", tags=["Operations"])
app.include_router(rules.router, prefix="/api/v1", tags=["Rules"])
app.include_router(insights.router, prefix="/api/v1", tags=["Insights"])


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
