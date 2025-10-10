from pydantic import BaseModel, EmailStr, AwareDatetime, field_validator
from typing import Optional, List
from datetime import datetime
from .models import UserRole, ModelStatus
import re

class ModelResultBase(BaseModel):
    label: str
    health_score: float
    notes: Optional[str] = None

    @field_validator("label")
    def validate_label_length(cls, v: str) -> str:
        if len(v) > 50:
            raise ValueError("Label must be 50 characters or less")
        return v

    @field_validator("health_score")
    def validate_health_score(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError("Health score must be between 0.0 and 1.0")
        return v

class ModelResultCreate(ModelResultBase):
    pass

class ModelResult(ModelResultBase):
    id: int
    upload_id: int

    model_config = {"from_attributes": True}

class UploadBase(BaseModel):
    filename: str
    storage_filename: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    depth: Optional[float] = None
    notes: Optional[str] = None

    @field_validator("filename")
    def validate_filename_length(cls, v: str) -> str:
        if len(v) > 255:
            raise ValueError("Filename must be 255 characters or less")
        return v
    
    class Config:
        json_encoders = {
            ModelStatus: lambda v: v.name.lower(),
            datetime: lambda v: v.isoformat()
        }

class UploadCreate(UploadBase):
    user_id: int

class Upload(UploadBase):
    id: int
    user_id: int
    timestamp: AwareDatetime  # Ensures timezone-aware datetime
    model_status: ModelStatus
    model_results: List[ModelResult] = []  # should this be a list??

    model_config = {"from_attributes": True}

    @field_validator("model_status")
    def convert_status_to_enum(cls, v) -> str:
        if isinstance(v, str):
            try:
                return ModelStatus[v.upper()]
            except KeyError:
                raise ValueError(f"Invalid model status: {v}. Must be one of {[e.name for e in ModelStatus]}")
        return v

class UserBase(BaseModel):
    name: str
    username: str
    email: EmailStr
    affiliation: Optional[str] = None
    role: UserRole = UserRole.USER

    @field_validator("name")
    def validate_name_length(cls, v: str) -> str:
        if len(v) > 100:
            raise ValueError("Name must be 100 characters or less")
        return v

    @field_validator("username")
    def validate_username(cls, v: str) -> str:
        # check length
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if len(v) > 50:
            raise ValueError("Username must be at most 50 characters long")
        # check alphanumeric + underscores/hyphens
        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError("Username must contain only alphanumeric characters, underscores, or hyphens")
        # check reserved words
        reserved_words = {"admin", "root", "system", "user"}
        if v.lower() in reserved_words:
            raise ValueError(f"Username cannot be a reserved word")
        return v

    @field_validator("email")
    def validate_email_length(cls, v: str) -> str:
        if len(v) > 255:
            raise ValueError("Email must be 255 characters or less")
        return v

    @field_validator("affiliation")
    def validate_affiliation_length(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 100:
            raise ValueError("Affiliation must be 100 characters or less")
        return v
    
    @field_validator("role")
    def convert_role_to_enum(cls, v) -> str:
        if isinstance(v, str):
            try:
                return UserRole[v.upper()]
            except KeyError:
                raise ValueError(f"Invalid role: {v}. Must be one of {[e.name for e in UserRole]}")
        return v
    
    class Config:
        # Enable serialization of UserRole enum to its value (e.g., "user")
        json_encoders = {
            UserRole: lambda v: v.name.lower(),
            datetime: lambda v: v.isoformat()
        }

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    def validate_password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class Token(BaseModel):  # for JWT token response
    access_token: str
    token_type: str

class User(UserBase):
    id: int
    created_at: AwareDatetime  # Ensures timezone-aware datetime
    uploads: List[Upload] = []
    hashed_password: str
    token: Optional[Token]

    model_config = {"from_attributes": True}

class UserPublic(UserBase):
    id: int
    created_at: AwareDatetime

    model_config = {"from_attributes": True}
