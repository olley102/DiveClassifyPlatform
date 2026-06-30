from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .database import Base, engine, get_db
from .routers import users, uploads
from .schemas import Token
from . import auth
import logging
from contextlib import asynccontextmanager
from datetime import timedelta

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

@app.post("/token", response_model=Token)  # TODO: move to auth and make auth a router
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
