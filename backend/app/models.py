from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from datetime import datetime, timezone
from .database import Base
import enum

# Define enum for model_status
class ModelStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class UTCDateTime(TypeDecorator):
    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if value.tzinfo is None:
                raise ValueError("created_at must be timezone-aware")
            return value.astimezone(timezone.utc)  # Store as UTC
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return value.replace(tzinfo=timezone.utc)  # Return as UTC-aware
        return value

class UserRole(enum.Enum):  # could have more options
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    affiliation = Column(String(100), nullable=True)
    created_at = Column(UTCDateTime, default=lambda: datetime.now(timezone.utc))
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    uploads = relationship("Upload", back_populates="user", cascade="all, delete-orphan")

class Upload(Base):
    __tablename__ = "uploads"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    filename = Column(String(255), nullable=False)
    storage_filename = Column(String(100), unique=True, nullable=False)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    timestamp = Column(UTCDateTime, default=lambda: datetime.now(timezone.utc))
    depth = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    model_status = Column(Enum(ModelStatus), default=ModelStatus.PENDING)

    user = relationship("User", back_populates="uploads")
    model_results = relationship("ModelResult", back_populates="upload", cascade="all, delete-orphan")

class ModelResult(Base):
    __tablename__ = "model_results"
    id = Column(Integer, primary_key=True)
    upload_id = Column(Integer, ForeignKey("uploads.id", ondelete="CASCADE"))
    label = Column(String(50), nullable=False)
    health_score = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)

    upload = relationship("Upload", back_populates="model_results")
