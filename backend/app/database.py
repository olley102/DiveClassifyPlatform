from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import logging

# configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = "sqlite:///./dive_data.db"
# later change to:
# SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dive_data.db")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})  # change to PostgreSQL later
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
