"""
Tumorra Lay Strategy API

FastAPI application for the horse racing lay betting strategy platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.api.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {'Development' if settings.debug else 'Production'}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    ## Tumorra Lay Strategy Platform API
    
    A sophisticated betting strategy platform that analyzes UK & Ireland 
    horse racing data to identify profitable lay betting opportunities.
    
    ### Features
    
    * **Strategy Management** - Configure and manage lay betting strategies
    * **Race Analysis** - Identify qualifying races based on strategy rules
    * **Backtesting** - Test strategies against historical data
    * **Performance Tracking** - Monitor P&L and key metrics
    * **Data Integration** - Import Betfair data and connect to BigQuery
    
    ### Strategy Overview
    
    The core "Smart Favorite Lay" strategy focuses on laying favorites 
    with BSP odds between 2.0-4.5 in races with 6-20 runners, with 
    adjustments for going conditions, track type, and seasonal factors.
    """,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(api_router, prefix=settings.api_prefix)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run."""
    return {"status": "healthy", "version": settings.app_version}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": f"{settings.api_prefix}/docs" if settings.debug else "disabled",
        "health": "/health",
    }


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else None,
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
