from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from .database import Base, engine
from .routers import users, uploads, token
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
    allow_origins=["http://localhost:5173"],  # Adjust to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(token.router)
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
app.mount("/files", StaticFiles(directory="app/uploads"), name="files")

# Global exception handler
from sqlalchemy.exc import SQLAlchemyError

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    logger.error(f"Database error: {str(exc)}")
    return {"detail": "Database error occurred"}, 500

@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request, exc):
    errors = {}
    for err in exc.errors():
        field = err["loc"][-1]
        errors[field] = err["msg"].replace("Value error, ", "")
    return JSONResponse(status_code=422, content={"errors": errors})
