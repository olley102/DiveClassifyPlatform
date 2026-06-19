from pydantic import BaseModel, EmailStr, AwareDatetime, field_validator
from typing import Optional, List
from datetime import datetime
from .models import UserRole, LabelType, VerificationStatus
import re

class UploadBase(BaseModel):
    filename: str
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
            LabelType: lambda v: v.name.lower(),
            VerificationStatus: lambda v: v.name.lower(),
            datetime: lambda v: v.isoformat()
        }

class UploadCreate(UploadBase):
    user_id: int
    storage_filename: str

class Upload(UploadBase):
    id: int
    user_id: int
    storage_filename: str
    timestamp: AwareDatetime  # Ensures timezone-aware datetime
    verification_status: VerificationStatus
    label_type: LabelType
    label: Optional[str] = None
    model_confidence: Optional[float] = None

    model_config = {"from_attributes": True}

class UpdateUploadLabel(UploadBase):
    label_type: LabelType
    label: str
    model_confidence: Optional[float] = None

    @field_validator("label")
    def validate_label_length(cls, v: str) -> str:
        if len(v) > 50:
            raise ValueError("Label must be 50 characters or less")
        return v
    
    @field_validator("model_confidence")
    def validate_model_confidence(cls, v: float | None) -> float | None:
        if (v is not None) and (not 0.0 <= v <= 1.0):
            raise ValueError("Model confidence must be between 0 and 1")
        return v

class UpdateUploadVerification(UploadBase):
    verification_status: VerificationStatus

class UserBase(BaseModel):  # TODO: review schemas
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

class User(UserBase):
    id: int
    created_at: AwareDatetime  # Ensures timezone-aware datetime
    uploads: List[Upload] = []

    model_config = {"from_attributes": True}

class Token(BaseModel):  # for JWT token response
    access_token: str
    token_type: str
