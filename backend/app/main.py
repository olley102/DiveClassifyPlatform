from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import users, uploads, model_results
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables (use Alembic in production)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise
    yield
    # Shutdown: Clean up resources
    engine.dispose()
    logger.info("Database engine closed")

app = FastAPI(title="Dive Data Platform API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
app.include_router(model_results.router, prefix="/results", tags=["Model Results"])

# Global exception handler
from sqlalchemy.exc import SQLAlchemyError

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    logger.error(f"Database error: {str(exc)}")
    return {"detail": "Database error occurred"}, 500
